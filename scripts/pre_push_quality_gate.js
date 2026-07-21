/**
 * Copyright (c) 2026 Inso.Code
 * 
 * Strict Pre-Push Quality Gate Validator
 * Verifies that generated agent skill files (.md) meet absolute premium production standards.
 */

const fs = require('fs');
const path = require('path');

function validateAgentFile(filePath) {
    const filename = path.basename(filePath);
    const expectedName = filename.slice(0, -3).toLowerCase();
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Verify Frontmatter exists and parses
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) {
        return { valid: false, reason: "Missing or invalid YAML frontmatter delimiters (---)" };
    }
    
    const lines = frontmatterMatch[1].split('\n');
    let nameVal = '';
    let descriptionVal = '';
    let modelVal = '';
    
    for (const line of lines) {
        const idx = line.indexOf(':');
        if (idx !== -1) {
            const key = line.substring(0, idx).trim();
            const val = line.substring(idx + 1).trim();
            if (key === 'name') nameVal = val.toLowerCase();
            if (key === 'description') descriptionVal = val;
            if (key === 'model') modelVal = val;
        }
    }
    
    if (!nameVal) {
        return { valid: false, reason: "Frontmatter missing 'name:' field" };
    }
    if (nameVal !== expectedName) {
        return { valid: false, reason: `Frontmatter name "${nameVal}" does not match filename "${expectedName}"` };
    }
    if (!descriptionVal) {
        return { valid: false, reason: "Frontmatter missing 'description:' field" };
    }
    if (!modelVal) {
        return { valid: false, reason: "Frontmatter missing 'model:' field" };
    }
    
    // 2. Verify Checklist Section and checkable items
    if (!content.includes('Core Compliance Checklist')) {
        return { valid: false, reason: "Missing 'Core Compliance Checklist' section header" };
    }
    
    const checklistItems = content.match(/- \[[ x]\] \*\*[^*]+\*\*/g);
    if (!checklistItems || checklistItems.length < 2) {
        return { valid: false, reason: "Checklist must contain at least 2 checkable items in the format: - [ ] **Bold description**" };
    }
    
    // 3. Verify Anti-Patterns Section exists and has formatted table
    if (!content.includes('## Anti-Patterns')) {
        return { valid: false, reason: "Missing '## Anti-Patterns' section header" };
    }
    
    // 4. Verify Technical Decision Record (TDR) Template exists
    if (!content.includes('## Technical Decision Record (TDR) Template')) {
        return { valid: false, reason: "Missing '## Technical Decision Record (TDR) Template' section header" };
    }
    if (!content.includes('TDR-[')) {
        return { valid: false, reason: "Missing TDR code block template (TDR-[000])" };
    }
    
    // 5. Verify no raw/blank templates or developer placeholders
    const placeholders = ['TODO:', '[add detail]', '[insert detail]', '<insert ', 'your name here'];
    for (const ph of placeholders) {
        if (content.toLowerCase().includes(ph)) {
            return { valid: false, reason: `Found prohibited developer placeholder: "${ph}"` };
        }
    }
    
    return { valid: true };
}

function runQualityCheck(targetDir) {
    if (!fs.existsSync(targetDir)) {
        console.log(`ℹ️ Target directory does not exist, skipping: ${targetDir}`);
        return true;
    }
    
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    let totalChecked = 0;
    let failed = 0;
    
    for (const entry of entries) {
        // Only validate .md files that are actual agent skill profiles (excluding special indexing documents)
        if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
            const fullPath = path.join(targetDir, entry.name);
            totalChecked++;
            
            const result = validateAgentFile(fullPath);
            if (!result.valid) {
                console.error(`❌ Quality Gate FAILED for [${entry.name}]: ${result.reason}`);
                failed++;
            }
        }
    }
    
    if (failed > 0) {
        console.error(`🚨 Quality Gate Failed! Checked ${totalChecked} files, ${failed} failed validation.`);
        return false;
    }
    
    console.log(`✅ Quality Gate passed! Verified ${totalChecked} agent skill profiles successfully.`);
    return true;
}

// Support direct execution via command line
if (require.main === module) {
    const args = process.argv.slice(2);
    const targetDir = args[0] || path.join(__dirname, '..', '.agent', 'skills');
    console.log(`🛡️ Running Pre-Push Quality Gate on directory: ${targetDir}`);
    const passed = runQualityCheck(targetDir);
    process.exit(passed ? 0 : 1);
}

module.exports = { validateAgentFile, runQualityCheck };
