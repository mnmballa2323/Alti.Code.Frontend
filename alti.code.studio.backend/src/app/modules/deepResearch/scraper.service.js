import express from 'express';
import puppeteer from 'puppeteer-core';
import { azureStorageService } from '../gcpCloud/gcpStorage.service.js';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';
import config from '../../../../config/index.js';

// Standalone express app for the Azure Container Apps scraping fleet
const app = express();
app.use(express.json());

const azureStorage = azureStorageService;

/**
 * The deep research headless scraper
 */
app.post('/api/v1/research/scrape', async (req, res) => {
  const { url, topicId } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  logger.info(`🕷️ [Deep Researcher] Spinning up Headless Chromium for: ${url}`);

  let browser = null;
  try {
    browser = await puppeteer.launch({
      executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
      headless: 'new',
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Extract all meaningful text content
    const textContent = await page.evaluate(() => {
      // Remove scripts, styles, navs
      document
        .querySelectorAll('script, style, nav, footer, iframe')
        .forEach(el => el.remove());
      return document.body.innerText;
    });

    // Hash the URL for storage blob name
    const urlHash = crypto.createHash('md5').update(url).digest('hex');
    const containerName =
      config.azure?.researchContainer || 'alti-research-data';
    const blobName = `research/${topicId || 'general'}/${urlHash}.txt`;

    logger.info(
      `💾 [Deep Researcher] Pushing ${textContent.length} characters to Azure Blob Storage (Container: ${containerName}, Blob: ${blobName})`,
    );

    await azureStorage.uploadContent(containerName, blobName, textContent);

    res.status(200).json({
      success: true,
      message: 'Successfully scraped and ingested to Azure Blob Storage',
      blobName,
      contentLength: textContent.length,
    });
  } catch (error) {
    logger.error(`❌ [Deep Researcher] Scraping failed for ${url}:`, error);
    res.status(500).json({ error: 'Scraping failed', details: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 8080;
if (process.env.RUN_AS_WORKER === 'true') {
  app.listen(PORT, () => {
    logger.info(
      `🚀 [Deep Researcher] Azure Container Apps Scraper Fleet Agent listening on port ${PORT}`,
    );
  });
}

export default app;
