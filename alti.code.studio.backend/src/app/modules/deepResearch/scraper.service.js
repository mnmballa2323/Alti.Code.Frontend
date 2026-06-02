import express from 'express';
import puppeteer from 'puppeteer-core';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';
import config from '../../../../config/index.js';

// Standalone express app for the Cloud Run scraping fleet
const app = express();
app.use(express.json());

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

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
      document.querySelectorAll('script, style, nav, footer, iframe').forEach(el => el.remove());
      return document.body.innerText;
    });

    // Hash the URL for S3 key
    const urlHash = crypto.createHash('md5').update(url).digest('hex');
    const s3Key = `research/${topicId || 'general'}/${urlHash}.txt`;

    logger.info(`💾 [Deep Researcher] Pushing ${textContent.length} characters to AWS S3 Data Lake (Bucket: ${config.aws.researchBucket}, Key: ${s3Key})`);

    await s3Client.send(new PutObjectCommand({
      Bucket: config.aws.researchBucket,
      Key: s3Key,
      Body: textContent,
      ContentType: 'text/plain'
    }));

    res.status(200).json({ 
        success: true, 
        message: 'Successfully scraped and ingested to S3',
        s3Key,
        contentLength: textContent.length 
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
        logger.info(`🚀 [Deep Researcher] Cloud Run Scraper Fleet Agent listening on port ${PORT}`);
    });
}

export default app;
