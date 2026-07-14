/**
 * Workspace Terminal Test Script
 * Run this to verify Socket.io streaming of PTY (node-pty) from backend.
 */

import { io } from 'socket.io-client';

console.log('Testing Workspace Terminal Socket Connection...');
const socket = io('http://localhost:3000');

const WORKSPACE_ID = 'test-workspace-123';

socket.on('connect', () => {
  console.log('✅ Connected to backend Socket.io server');
  
  // 1. Connect to Terminal
  console.log(`📡 Requesting terminal stream for workspace ${WORKSPACE_ID}...`);
  socket.emit('workspace_terminal_connect', { workspaceId: WORKSPACE_ID, command: '/bin/bash' });
  
  // 2. Listen for output
  socket.on('workspace_terminal_data', (data) => {
    if (data.workspaceId === WORKSPACE_ID) {
      process.stdout.write(data.output);
    }
  });

  socket.on('workspace_terminal_error', (err) => {
    console.error('❌ Terminal Error:', err);
    process.exit(1);
  });

  // 3. Send test command after 1 second
  setTimeout(() => {
    console.log('\n⌨️ Sending "ls -la" command...');
    socket.emit(`workspace_terminal_input_${WORKSPACE_ID}`, 'ls -la\n');
  }, 1000);

  // 4. Test LSP Sync
  setTimeout(() => {
    console.log('\n⌨️ Testing LSP Sync...');
    socket.emit('workspace_lsp_sync', {
      workspaceId: WORKSPACE_ID,
      rpcPayload: { jsonrpc: '2.0', id: 1, method: 'initialize' }
    });
  }, 2000);

  socket.on('workspace_lsp_response', (data) => {
    if (data.workspaceId === WORKSPACE_ID) {
      console.log('✅ Received LSP Response:', data.rpcPayload);
      setTimeout(() => process.exit(0), 1000);
    }
  });
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
