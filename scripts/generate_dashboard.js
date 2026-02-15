const fs = require('fs');
const { execSync } = require('child_process');

function getSubmodules() {
    try {
        const output = execSync('git submodule status').toString();
        if (!output) return [];
        
        return output.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const parts = line.trim().split(/\s+/);
                // Status char is first (+, -, or space)
                const commit = parts[0].replace(/^[\+\-]/, '');
                const path = parts[1];
                return { commit, path };
            });
    } catch (error) {
        console.error('Error getting submodules:', error);
        return [];
    }
}

function generateDashboard() {
    const submodules = getSubmodules();
    const timestamp = new Date().toISOString();
    
    let content = `# 📊 Submodule Dashboard\n\n`;
    content += `> **Last Updated:** ${timestamp}\n\n`;
    
    if (submodules.length === 0) {
        content += `*No submodules found or error accessing git.*\n`;
    } else {
        content += `| Path | Commit | Last Update |\n`;
        content += `|------|--------|-------------|\n`;
        
        submodules.forEach(sub => {
            let date = 'Unknown';
            try {
                // Get the commit date from the submodule directory
                // We need to run git log inside the submodule path
                date = execSync(`cd ${sub.path} && git log -1 --format=%cd`).toString().trim();
            } catch (e) {
                console.error(`Could not get date for ${sub.path}:`, e.message);
            }
            content += `| \`${sub.path}\` | \`${sub.commit.substring(0,7)}\` | ${date} |\n`;
        });
        
        content += `\n## 📂 Directory Structure\n\n`;
        content += `- **Root**: Project Configuration & Orchestration\n`;
        submodules.forEach(sub => {
            content += `- **${sub.path}**: Component Source Code\n`;
        });
    }

    fs.writeFileSync('SUBMODULE_DASHBOARD.md', content);
    console.log('Dashboard generated at SUBMODULE_DASHBOARD.md');
}

generateDashboard();
