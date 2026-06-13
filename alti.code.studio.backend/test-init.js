import { workerFactory } from './src/app/modules/queue/worker.factory.js';
process.env.NODE_ENV = 'test';
process.env.DISABLE_REDIS = 'false';
async function test() {
    await workerFactory.init();
    console.log(workerFactory.failedWorkers);
    console.log(Object.keys(workerFactory.workers));
}
test();
