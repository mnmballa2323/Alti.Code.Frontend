
import { authMiddleware } from './src/app/middlewares/auth.middleware.js';
import { jwtHelpers } from './src/app/helpers/jwtHelpers.js';
import config from './config/index.js';

// Mock Config for Test
config.jwt = { access_token: 'secret' };

async function checkRBAC() {
    console.log('--- Checking The Network (RBAC) ---');

    // Helper to mock Req/Res/Next
    const mockReq = (role) => ({
        headers: { authorization: jwtHelpers.createToken({ role, _id: '123' }, 'secret', '1h') }
    });
    const mockRes = {};
    const mockNext = (err) => {
        if (err) throw err;
    };

    let allPass = true;

    // 1. Admin Route Test
    console.log('\n🔒 [1/2] Testing Admin Route Protection...');
    try {
        console.log('   - Admin accessing Admin Route...');
        const adminGuard = authMiddleware('admin');
        await adminGuard(mockReq('admin'), mockRes, mockNext);
        console.log('   ✅ Allowed.');

        console.log('   - User accessing Admin Route...');
        try {
            await adminGuard(mockReq('user'), mockRes, mockNext);
            console.error('   ❌ FAILED: User should be blocked.');
            allPass = false;
        } catch (e) {
            if (e.statusCode === 403) console.log('   ✅ Blocked correctly (403).');
            else throw e;
        }

    } catch (e) {
        console.error('   ❌ Unexpected Error:', e);
        allPass = false;
    }

    // 2. User Route Test
    console.log('\n🔓 [2/2] Testing User Route Protection...');
    try {
        console.log('   - User accessing User Route...');
        const userGuard = authMiddleware('user', 'developer');
        await userGuard(mockReq('user'), mockRes, mockNext);
        console.log('   ✅ Allowed.');

    } catch (e) {
        console.error('   ❌ Unexpected Error:', e);
        allPass = false;
    }

    if (allPass) {
        console.log('\n✅ RBAC Verification Passed');
        process.exit(0);
    } else {
        console.error('\n❌ Verification Failed');
        process.exit(1);
    }
}

checkRBAC();
