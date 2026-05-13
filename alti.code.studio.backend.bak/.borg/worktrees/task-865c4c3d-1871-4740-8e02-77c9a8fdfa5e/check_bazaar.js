
import { PluginInterface } from './src/app/modules/mcp/plugin.interface.js';
import { PluginInterface } from './src/app/modules/mcp/plugin.interface.js';
import fs from 'fs';

const PluginRegistry = JSON.parse(fs.readFileSync('./src/app/modules/mcp/plugin.registry.json', 'utf8'));

async function checkBazaar() {
    console.log('--- Checking The Bazaar (Plugin Marketplace) ---');

    let allPass = true;

    // 1. Verify Interface
    console.log('[1/2] Verifying Plugin Interface...');
    try {
        const plugin = new PluginInterface({});
        if (plugin.name === 'GenericPlugin') {
            console.log('   ✅ Interface defined correctly.');
        } else {
            console.error('   ❌ Interface mismatch.');
            allPass = false;
        }
    } catch (e) {
        console.error('   ❌ Interface Error:', e);
        allPass = false;
    }

    // 2. Verify Registry
    console.log('[2/2] Verifying Plugin Registry...');
    if (PluginRegistry.plugins.length >= 3) {
        console.log(`   ✅ Registry loaded with ${PluginRegistry.plugins.length} plugins.`);
        const githubPlugin = PluginRegistry.plugins.find(p => p.id === 'github-pilot');
        if (githubPlugin && githubPlugin.enabled) {
            console.log('   ✅ Github Pilot is enabled.');
        } else {
            console.error('   ❌ Github Pilot missing or disabled.');
            allPass = false;
        }
    } else {
        console.error('   ❌ Registry empty or malformed.');
        allPass = false;
    }

    if (allPass) {
        console.log('\n✅ Bazaar Verification Passed');
        process.exit(0);
    } else {
        console.error('\n❌ Verification Failed');
        process.exit(1);
    }
}

checkBazaar();
