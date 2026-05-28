/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Page Browser Automation Integration Test Runner
 * Verifies SSRF security blocks, mock launches, and content harvesting.
 */

import { PageBrowserAutomation } from '../src/app/modules/browser/page_browser_automation.js';
import puppeteer from 'puppeteer';
import assert from 'assert';

async function runTest() {
    console.log('🧪 INITIALIZING PAGE BROWSER AUTOMATION TEST...');

    // 1. Test Case: Zero-Trust SSRF Block
    console.log('\n🏃 Test 1: Testing Zero-Trust SSRF URL boundary traps...');
    const localUrls = [
        'http://localhost:5000/admin',
        'http://127.0.0.1/db',
        'http://169.254.169.254/computeMetadata/v1/', // Cloud Metadata
        'https://192.168.1.1/router'
    ];

    for (const url of localUrls) {
        try {
            await PageBrowserAutomation.scrapePage(url);
            assert.fail(`Should have blocked local SSRF URL: ${url}`);
        } catch (e) {
            console.log(`  ✅ SSRF correctly intercepted for: ${url}. Error: "${e.message}"`);
            assert.ok(e.message.includes('SSRF Blocked') || e.message.includes('Zero-Trust URL Trap'));
        }
    }

    // 2. Test Case: Happy Path scraping with stubbed Puppeteer
    console.log('\n🏃 Test 2: Testing happy path scraping via stubbed Puppeteer browser...');
    
    // Stub puppeteer.launch
    const originalLaunch = puppeteer.launch;
    puppeteer.launch = async () => {
        return {
            newPage: async () => ({
                setViewport: async () => {},
                goto: async () => {},
                evaluate: async () => ({
                    title: 'Compliant Permissive Library',
                    text: 'Pure MIT and Apache-2.0 licenses only.',
                    html: '<div>Pruned</div>'
                }),
                screenshot: async () => {},
            }),
            close: async () => {}
        };
    };

    try {
        const result = await PageBrowserAutomation.scrapePage('https://example.com/permissive', {
            screenshotPath: './logs/test_browser/example.png'
        });
        console.log(JSON.stringify(result, null, 2));

        assert.equal(result.success, true);
        assert.equal(result.title, 'Compliant Permissive Library');
        assert.ok(result.extractedText.includes('Pure MIT and Apache-2.0'));
        assert.equal(result.hasScreenshot, true);
        console.log('✅ Happy path browser scraping verified successfully.');
    } finally {
        // Restore original launch
        puppeteer.launch = originalLaunch;
    }

    console.log('\n🎉 ALL PAGE BROWSER AUTOMATION Observability PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch(console.error);
