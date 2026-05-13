
import { io } from 'socket.io-client';

async function checkHive() {
    console.log('--- Checking The Hive (Real-Time) ---');

    return new Promise((resolve, reject) => {
        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('✅ Client connected to Hive successfully.');
            socket.disconnect();
            console.log('\n✅ Hive Verification Passed');
            process.exit(0);
        });

        socket.on('connect_error', (err) => {
            console.error('❌ Connection Failed:', err.message);
            console.log('Ensure server is running and socket.io is installed.');
            process.exit(1);
        });

        // Timeout
        setTimeout(() => {
            console.error('❌ Connection Timeout');
            process.exit(1);
        }, 5000);
    });
}

checkHive();
