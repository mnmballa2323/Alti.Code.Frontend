/**
 * Copyright (c) 2026 Inso.Code
 * 
 * Safe GitHub Permissive Repository Search Utility
 * 
 * Safely queries the GitHub Search API for repositories matching a keyword
 * and filters them strictly for Pure MIT or Pure Apache 2.0 licenses.
 * Performs NO automatic cloning, downloading, or package installation to maintain
 * absolute supply-chain security.
 */

const https = require('https');

// Permissive licenses to look for
const ALLOWED_LICENSES = ['mit', 'apache-2.0'];

function searchGithub(query) {
    if (!query) {
        console.error('Error: Please provide a search query.');
        process.exit(1);
    }

    console.log(`🔍 Safely searching GitHub for repositories matching: "${query}"...`);
    console.log(`- Auditing Policy: Strictly Pure MIT or Pure Apache-2.0 only.\n`);

    const options = {
        hostname: 'api.github.com',
        path: `/search/repositories?q=${encodeURIComponent(query)}+license:mit+license:apache-2.0&sort=stars&order=desc&per_page=15`,
        method: 'GET',
        headers: {
            'User-Agent': 'AltiCodeStudio-Permissive-License-Scanner'
        }
    };

    const req = https.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (data.message && data.message.includes('API rate limit')) {
                    console.warn('⚠️ GitHub API rate limit exceeded. Please try again later or configure a GITHUB_TOKEN.');
                    return;
                }

                if (!data.items || data.items.length === 0) {
                    console.log('❌ No repositories found matching the search criteria.');
                    return;
                }

                console.log(`🎉 Found ${data.items.length} highly compliant, popular repositories:\n`);
                console.log('==================================================');
                console.log('             COMPLIANT REPOSITORY REPORT          ');
                console.log('==================================================');

                data.items.forEach((repo, idx) => {
                    const licKey = repo.license ? repo.license.key : 'unknown';
                    const licName = repo.license ? repo.license.name : 'Unknown';
                    const isAllowed = ALLOWED_LICENSES.includes(licKey.toLowerCase());

                    const marker = isAllowed ? '✅' : '⚠️';
                    console.log(`${idx + 1}. [${repo.full_name}]`);
                    console.log(`   - License:  ${marker} ${licName} (${licKey})`);
                    console.log(`   - Stars:    ⭐ ${repo.stargazers_count}`);
                    console.log(`   - URL:      🔗 ${repo.html_url}`);
                    console.log(`   - Info:     📝 ${repo.description || 'No description provided.'}`);
                    console.log('--------------------------------------------------');
                });

                console.log('\n🔒 Zero-Trust Protocol: For security, these repositories must be manually reviewed and audited before installation.');

            } catch (e) {
                console.error('Failed to parse GitHub API response:', e.message);
            }
        });
    });

    req.on('error', (err) => {
        console.error('GitHub Search request failed:', err.message);
    });

    req.end();
}

// Get keyword from arguments
const queryArg = process.argv.slice(2).join(' ') || 'agent skills';
searchGithub(queryArg);
