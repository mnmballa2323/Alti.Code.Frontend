
import { postgresClient } from './src/app/shared/postgres.client.js';

console.log('Import successful');
console.log('Client:', postgresClient ? 'Defined' : 'Undefined');
