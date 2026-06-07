/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js'; // Try index.js explicitly if client fails, or just client
// Actually package.json says "./client" -> ".../index.js", so "sdk/client" should work.
// But let's try strict pathing.

try {
    console.log('Attempting imports...');
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
    console.log('Client imported');

    // Wildcard match for sse.js
    const { SSEClientTransport } = await import('@modelcontextprotocol/sdk/client/sse.js');
    console.log('SSETransport imported');

} catch (e) {
    console.error('Import failed:', e);
}
