import { DeepsecService } from './src/app/modules/security/deepsec.service.js';

async function testDeepsec() {
  const result = await DeepsecService.scanCodebase('.');
  console.log(JSON.stringify(result, null, 2));
}

testDeepsec();
