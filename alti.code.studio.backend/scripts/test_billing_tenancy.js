// Tink-crypto environment polyfill
global.self = global;

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import httpStatus from 'http-status';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to log test phases
const logTest = (name, status, details = '') => {
    const icon = status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} [Billing & Tenancy Test] ${name} -> ${status} ${details}`);
};

async function testLimits() {
    console.log('\n--- Test Phase 1: Subscription Usage Limits ---');
    try {
        const { checkUsageLimits } = await import('../src/app/middlewares/checkUsageLimits/checkUsageLimits.js');
        
        // Mock subscription data that exceeds limits
        const mockSubExceeded = {
            plan_name: 'launch',
            usage: { promptsUsed: 11, imagesUsed: 5 },
            paymentStatus: 'paid',
            expiresAt: new Date(Date.now() + 1000000)
        };

        const { default: SubscriptionModel } = await import('../src/app/modules/payment/payment.model.js');
        
        const originalFindOne = SubscriptionModel.findOne;
        
        // Stub to return exceeded sub directly
        SubscriptionModel.findOne = () => mockSubExceeded;
        
        let threw = false;
        try {
            await checkUsageLimits('mock-user-id');
        } catch (e) {
            threw = true;
            if (e.message.includes('limit reached')) {
                logTest('Usage limit exceeding check', 'PASSED', `(Threw expected error: ${e.message})`);
            } else {
                logTest('Usage limit exceeding check', 'FAILED', `(Unexpected error: ${e.message})`);
            }
        }
        if (!threw) {
            logTest('Usage limit exceeding check', 'FAILED', '(Failed to throw error when limits were exceeded)');
        }

        // Stub to return valid sub within limits directly
        const mockSubValid = {
            plan_name: 'launch',
            usage: { promptsUsed: 2, imagesUsed: 1 },
            paymentStatus: 'paid',
            expiresAt: new Date(Date.now() + 1000000)
        };
        SubscriptionModel.findOne = () => mockSubValid;

        try {
            const result = await checkUsageLimits('mock-user-id');
            if (result.plan_name === 'launch') {
                logTest('Valid usage allowance check', 'PASSED');
            } else {
                logTest('Valid usage allowance check', 'FAILED', '(Returned incorrect subscription)');
            }
        } catch (e) {
            logTest('Valid usage allowance check', 'FAILED', `(Threw unexpected error: ${e.message})`);
        }

        // Restore findOne
        SubscriptionModel.findOne = originalFindOne;
    } catch (e) {
        logTest('Usage limits setup', 'FAILED', e.message);
    }
}

async function testModelRestrictions() {
    console.log('\n--- Test Phase 2: Enterprise Model Vendor Restrictions ---');
    try {
        const { LlmGatewayService } = await import('../src/app/modules/llmGateway/llmGateway.service.js');
        const { default: SubscriptionModel } = await import('../src/app/modules/payment/payment.model.js');
        const { VaultService } = await import('../src/app/modules/vault/vault.service.js');

        const originalFindOne = SubscriptionModel.findOne;
        const originalGetRawCredentials = VaultService.getRawCredentials;

        // Stub VaultService.getRawCredentials to bypass DB/Vault lookup
        VaultService.getRawCredentials = async () => ({
            openaiApiKey: 'mock-key',
            azureEndpoint: 'https://mock.openai.azure.com',
            azureApiKey: 'mock-key',
            gcpProjectId: 'mock-project'
        });

        // 1. AWS Enterprise plan test
        SubscriptionModel.findOne = () => ({
            plan_name: 'enterprise-aws',
            paymentStatus: 'paid',
            expiresAt: new Date(Date.now() + 1000000)
        });

        // Try requesting GCP model (should throw)
        try {
            await LlmGatewayService.routeCompletion('mock-user-id', 'session-id', 'hello', 'gemini-3.1-pro');
            logTest('AWS Enterprise restricts GCP models', 'FAILED', '(Did not throw FORBIDDEN error)');
        } catch (e) {
            if (e.statusCode === httpStatus.FORBIDDEN && e.message.includes('AWS Bedrock models')) {
                logTest('AWS Enterprise restricts GCP models', 'PASSED');
            } else {
                logTest('AWS Enterprise restricts GCP models', 'FAILED', `(Unexpected error: ${e.message})`);
            }
        }

        // Try requesting AWS model (should try to execute and fail on Bedrock init, not on FORBIDDEN routing)
        try {
            await LlmGatewayService.routeCompletion('mock-user-id', 'session-id', 'hello', 'claude-5-sonnet');
            logTest('AWS Enterprise allows AWS models', 'FAILED', '(Completed successfully without keys)');
        } catch (e) {
            if (e.message.includes('AWS Bedrock credentials') && e.message.includes('missing')) {
                logTest('AWS Enterprise allows AWS models', 'PASSED', '(Bypassed lock filter and reached AWS client init)');
            } else {
                logTest('AWS Enterprise allows AWS models', 'FAILED', `(Unexpected client error: ${e.message})`);
            }
        }

        // Try auto/default override
        try {
            await LlmGatewayService.routeCompletion('mock-user-id', 'session-id', 'hello', 'auto');
        } catch (e) {
            if (e.message.includes('AWS Bedrock credentials') && e.message.includes('missing')) {
                logTest('AWS Enterprise auto-routes to Bedrock', 'PASSED', '(Auto resolved to AWS model)');
            } else {
                logTest('AWS Enterprise auto-routes to Bedrock', 'FAILED', `(Unexpected client error: ${e.message})`);
            }
        }


        // 2. GCP Enterprise plan test
        SubscriptionModel.findOne = () => ({
            plan_name: 'enterprise-gcp',
            paymentStatus: 'paid',
            expiresAt: new Date(Date.now() + 1000000)
        });

        // Try requesting Azure model (should throw)
        try {
            await LlmGatewayService.routeCompletion('mock-user-id', 'session-id', 'hello', 'azure/gpt-4o');
            logTest('GCP Enterprise restricts Azure models', 'FAILED', '(Did not throw FORBIDDEN error)');
        } catch (e) {
            if (e.statusCode === httpStatus.FORBIDDEN && e.message.includes('GCP Vertex AI models')) {
                logTest('GCP Enterprise restricts Azure models', 'PASSED');
            } else {
                logTest('GCP Enterprise restricts Azure models', 'FAILED', `(Unexpected error: ${e.message})`);
            }
        }

        // Try requesting GCP model (should bypass block)
        try {
            await LlmGatewayService.routeCompletion('mock-user-id', 'session-id', 'hello', 'gemini-3.1-pro');
            logTest('GCP Enterprise allows GCP models', 'FAILED', '(Completed successfully without keys)');
        } catch (e) {
            if (e.message.includes('Google Vertex AI credentials') && e.message.includes('missing')) {
                logTest('GCP Enterprise allows GCP models', 'PASSED', '(Bypassed lock filter and reached Vertex client init)');
            } else {
                logTest('GCP Enterprise allows GCP models', 'FAILED', `(Unexpected client error: ${e.message})`);
            }
        }

        // Try auto/default override
        try {
            await LlmGatewayService.routeCompletion('mock-user-id', 'session-id', 'hello', 'auto');
        } catch (e) {
            if (e.message.includes('Google Vertex AI credentials') && e.message.includes('missing')) {
                logTest('GCP Enterprise auto-routes to Vertex', 'PASSED', '(Auto resolved to Vertex model)');
            } else {
                logTest('GCP Enterprise auto-routes to Vertex', 'FAILED', `(Unexpected client error: ${e.message})`);
            }
        }


        // 3. Azure Enterprise plan test
        SubscriptionModel.findOne = () => ({
            plan_name: 'enterprise-azure',
            paymentStatus: 'paid',
            expiresAt: new Date(Date.now() + 1000000)
        });

        // Try requesting AWS model (should throw)
        try {
            await LlmGatewayService.routeCompletion('mock-user-id', 'session-id', 'hello', 'claude-5-sonnet');
            logTest('Azure Enterprise restricts AWS models', 'FAILED', '(Did not throw FORBIDDEN error)');
        } catch (e) {
            if (e.statusCode === httpStatus.FORBIDDEN && e.message.includes('Azure OpenAI Foundry models')) {
                logTest('Azure Enterprise restricts AWS models', 'PASSED');
            } else {
                logTest('Azure Enterprise restricts AWS models', 'FAILED', `(Unexpected error: ${e.message})`);
            }
        }

        // Try requesting Azure model (should bypass block and attempt client completion)
        try {
            await LlmGatewayService.routeCompletion('mock-user-id', 'session-id', 'hello', 'azure/gpt-4o');
            logTest('Azure Enterprise allows Azure models', 'FAILED', '(Completed successfully without credentials)');
        } catch (e) {
            const isAzureErr = e.message.includes('Azure OpenAI Foundry endpoint') || e.message.includes('Connection error') || e.message.includes('fetch') || e.message.includes('ENOTFOUND');
            if (isAzureErr) {
                logTest('Azure Enterprise allows Azure models', 'PASSED', `(Bypassed lock filter: ${e.message})`);
            } else {
                logTest('Azure Enterprise allows Azure models', 'FAILED', `(Unexpected client error: ${e.message})`);
            }
        }

        // Try auto/default override
        try {
            await LlmGatewayService.routeCompletion('mock-user-id', 'session-id', 'hello', 'auto');
        } catch (e) {
            const isAzureErr = e.message.includes('Azure OpenAI Foundry endpoint') || e.message.includes('Connection error') || e.message.includes('fetch') || e.message.includes('ENOTFOUND');
            if (isAzureErr) {
                logTest('Azure Enterprise auto-routes to Azure', 'PASSED', `(Auto resolved to Azure model: ${e.message})`);
            } else {
                logTest('Azure Enterprise auto-routes to Azure', 'FAILED', `(Unexpected client error: ${e.message})`);
            }
        }

        // Restore stubs
        SubscriptionModel.findOne = originalFindOne;
        VaultService.getRawCredentials = originalGetRawCredentials;
    } catch (e) {
        logTest('Model restrictions test setup', 'FAILED', e.message);
    }
}

async function testTerraformIaC() {
    console.log('\n--- Test Phase 3: Terraform Single-Tenant Infrastructure Audit ---');
    try {
        const tfVarPath = path.join(__dirname, '../../terraform/variables.tf');
        if (!fs.existsSync(tfVarPath)) {
            logTest('Terraform variables exists check', 'FAILED', `(File not found at: ${tfVarPath})`);
            return;
        }

        const tfContent = fs.readFileSync(tfVarPath, 'utf8');

        const hasCustomerSubnet = tfContent.includes('customer_subnet_cidr');
        const hasCustomerId = tfContent.includes('customer_id');
        const hasDomain = tfContent.includes('customer_domain');

        if (hasCustomerSubnet && hasCustomerId && hasDomain) {
            logTest('Single-tenant Terraform variables audit', 'PASSED', '(customer_id, customer_subnet_cidr, customer_domain variables verified)');
        } else {
            logTest('Single-tenant Terraform variables audit', 'FAILED', '(Missing required customer variable declarations)');
        }
    } catch (e) {
        logTest('Terraform variables audit setup', 'FAILED', e.message);
    }
}

async function run() {
    await testLimits();
    await testModelRestrictions();
    await testTerraformIaC();
    console.log('\n=========================================');
    console.log('🏁 BILLING & TENANCY VERIFICATION CYCLE COMPLETE');
    console.log('=========================================\n');
}

run();
