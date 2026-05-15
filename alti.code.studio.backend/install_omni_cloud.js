import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import axios from 'axios';
import { promisify } from 'util';
import { CORE_OMNI_CLOUD_PROVIDERS as ORGS } from './src/app/modules/cloudAgents/core_providers.const.js';

const execAsync = promisify(exec);
const TARGET_DIR = path.join(process.cwd(), 'cloud_sovereign_repos');
const APPROVED_LICENSES = ['mit', 'apache-2.0'];

// To prevent destroying the hard drive, we will use shallow clones (--depth 1)
async function cloneRepo(org, repoName, cloneUrl) {
    const orgDir = path.join(TARGET_DIR, org);
    const repoDir = path.join(orgDir, repoName);

    if (!fs.existsSync(orgDir)) {
        fs.mkdirSync(orgDir, { recursive: true });
    }

    if (fs.existsSync(repoDir)) {
        console.log(`[SKIP] ${repoName} is already installed.`);
        return;
    }

    try {
        console.log(`[CLONING] ${org}/${repoName}...`);
        await execAsync(`git clone --depth 1 --single-branch --quiet ${cloneUrl} ${repoDir}`, { 
            timeout: 300000, 
            maxBuffer: 1024 * 1024 * 10 
        });
        console.log(`[SUCCESS] Installed ${repoName}`);
    } catch (e) {
        console.error(`[ERROR] Failed to install ${repoName}: ${e.message}`);
    }
}

async function startInstallation() {
    console.log('🚀 Initiating Massive Omni-Cloud Physical Installation...');
    if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });

    let installedCount = 0;

    for (const org of ORGS) {
        console.log(`\n🔍 Scanning organization: ${org}`);
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            try {
                // Using Unauthenticated GitHub API, subject to rate limits.
                // In production, provide GITHUB_TOKEN in env if available.
                const headers = { 'Accept': 'application/vnd.github.v3+json' };
                if (process.env.GITHUB_PAT) {
                    headers['Authorization'] = `token ${process.env.GITHUB_PAT}`;
                }

                const response = await axios.get(`https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`, { headers });
                
                const remaining = response.headers['x-ratelimit-remaining'];
                if (remaining && parseInt(remaining) < 5) {
                    const resetTime = parseInt(response.headers['x-ratelimit-reset']) * 1000;
                    const waitTime = resetTime - Date.now();
                    if (waitTime > 0) {
                        console.warn(`⚠️ Rate limit approaching. Sleeping for ${Math.ceil(waitTime / 1000)} seconds...`);
                        await new Promise(r => setTimeout(r, waitTime));
                    }
                }

                const repos = response.data;

                if (repos.length === 0) {
                    hasMore = false;
                    break;
                }

                const cloneTasks = [];
                for (const repo of repos) {
                    if (!repo.license || !repo.license.key) continue;
                    
                    const licenseKey = repo.license.key.toLowerCase();
                    if (APPROVED_LICENSES.includes(licenseKey)) {
                        cloneTasks.push(() => cloneRepo(org, repo.name, repo.clone_url));
                        installedCount++;
                    }
                }

                // Execute clones concurrently in batches of 10 to maximize network throughput
                // without overwhelming the host system's file descriptors or disk IO.
                const CONCURRENCY_LIMIT = 10;
                for (let i = 0; i < cloneTasks.length; i += CONCURRENCY_LIMIT) {
                    const chunk = cloneTasks.slice(i, i + CONCURRENCY_LIMIT);
                    await Promise.allSettled(chunk.map(task => task()));
                }
                
                page++;
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    const resetTime = parseInt(error.response.headers['x-ratelimit-reset']) * 1000;
                    const waitTime = resetTime - Date.now();
                    if (waitTime > 0) {
                        console.warn(`🛑 Rate limit hit. Waiting for ${Math.ceil(waitTime / 1000)} seconds...`);
                        await new Promise(r => setTimeout(r, waitTime));
                        continue; // Retry the same page
                    }
                }
                console.error(`❌ Failed to fetch page ${page} for ${org}. Error: ${error.message}`);
                hasMore = false; // Stop this org, try next
            }
        }
    }

    console.log(`\n✅ Massive Installation Complete. Fully physically installed ${installedCount} compliant cloud repositories into the backend.`);
}

startInstallation();
