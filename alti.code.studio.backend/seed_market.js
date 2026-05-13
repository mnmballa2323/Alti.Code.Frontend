import { marketSeeder } from './src/app/modules/enterprise/market.seeder.js';

async function run() {
    try {
        await marketSeeder.seed();
        console.log("Seeding process completed.");
        process.exit(0);
    } catch (err) {
        console.error("Error running seeder:", err);
        process.exit(1);
    }
}

run();
