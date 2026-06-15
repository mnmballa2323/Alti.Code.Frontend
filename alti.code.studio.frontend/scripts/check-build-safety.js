const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use (dev server is running)
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is free
    });
    server.listen(port);
  });
}

async function main() {
  const isDevRunning3000 = await checkPort(3000);
  const isDevRunning3005 = await checkPort(3005);
  if (isDevRunning3000 || isDevRunning3005) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  [WARNING] A Next.js dev server appears to be running on port 3000 or 3005.');
    console.warn('\x1b[33m%s\x1b[0m', 'Building Next.js production while dev is active can corrupt the dev server cache (.next/).');
    console.warn('\x1b[33m%s\x1b[0m', 'If you encounter unstyled pages or 404s, please restart the dev server with: rm -rf .next && npm run dev');
  }
}

main();
