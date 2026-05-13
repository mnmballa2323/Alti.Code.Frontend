import { GeminiExtensionService } from '../src/app/modules/geminiExtensions/geminiExtension.service.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * This script auto-discovers and installs all Gemini CLI extensions
 * from the official registry (https://geminicli.com/extensions) to grant
 * the Hive Mind agent swarm infinite capabilities.
 */

async function getExtensionUrls() {
    console.log('Fetching Gemini CLI extensions registry...');
    try {
        const response = await axios.get('https://geminicli.com/extensions/');
        const html = response.data;
        const $ = cheerio.load(html);
        const githubUrls = new Set();

        // The extensions page links to GitHub repositories for each extension.
        // We scrape all `href` attributes that match github.com
        $('a[href^="https://github.com/"]').each((i, link) => {
            const url = $(link).attr('href');
            // Filter out standard github links that aren't repos (like /about, /features)
            // Usually repo links have 2 path segments: github.com/owner/repo
            const parts = url.split('/').filter(Boolean);
            if (parts.length >= 3 && parts[1] !== 'features' && parts[1] !== 'about') {
                githubUrls.add(url);
            }
        });

        // Add known critical ones explicitly just in case scraping misses them
        githubUrls.add('https://github.com/gemini-cli-extensions/workspace');
        githubUrls.add('https://github.com/gemini-cli-extensions/mcp-server-browserbase');

        return Array.from(githubUrls);
    } catch (error) {
        console.error('Failed to fetch extension registry:', error.message);
        return [];
    }
}

async function installAll() {
    const extensionUrls = await getExtensionUrls();
    console.log(`Found ${extensionUrls.length} extensions to install.`);

    if (extensionUrls.length === 0) {
        console.log('No extensions found or offline. Ensure network is active.');
        return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const url of extensionUrls) {
        console.log(`Installing extension: ${url}...`);
        try {
            await GeminiExtensionService.installExtension(url);
            successCount++;
            console.log(`✅ Successfully installed ${url}`);
        } catch (error) {
            failCount++;
            console.error(`❌ Failed to install ${url}:`, error.message);
        }
    }

    console.log('--- Installation Summary ---');
    console.log(`Total attempted: ${extensionUrls.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log('All extensions are now registered in the agent ecosystem.');
}

installAll().catch(console.error);
