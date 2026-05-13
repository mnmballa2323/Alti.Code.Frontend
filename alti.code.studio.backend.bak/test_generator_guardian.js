// Mocks
const mockOpenAIResponse = {
    choices: [{
        message: {
            content: JSON.stringify({
                files: [{ path: 'index.html', content: '<h1>Hello</h1>' }]
            })
        }
    }]
};

const mockGuardianApproved = {
    safe: true,
    score: 95,
    reasoning: "Safe code"
};

const mockGuardianBlocked = {
    safe: false,
    score: 10,
    reasoning: "Malicious code detected"
};

// Mocking dependencies
const config = { openai_api_key: 'test-key' };
const logger = {
    info: (msg) => console.log('INFO:', msg),
    error: (msg) => console.log('ERROR:', msg),
    warn: (msg) => console.log('WARN:', msg)
};

// Mock GuardianService directly
const GuardianService = {
    auditCode: async (code) => {
        console.log('Guardian Context Audit:', code.substring(0, 50) + '...');
        if (code.includes('fail_me')) return mockGuardianBlocked;
        return mockGuardianApproved;
    }
};

// Mock OpenAI
class OpenAI {
    constructor() {
        this.chat = {
            completions: {
                create: async () => mockOpenAIResponse
            }
        };
    }
}

// Re-implementing the core logic of generateApp for testing purposes 
// (since we can't easily import the module with mocked dependencies in pure ES modules without a test runner)
const generateApp = async (prompt) => {
    logger.info(`Generating app from prompt: ${prompt}`);

    // Call OpenAI (Mocked)
    const openai = new OpenAI();
    const response = await openai.chat.completions.create({});
    let result = JSON.parse(response.choices[0].message.content);

    // Inject "fail_me" marker if prompt requests it, to simulate unsafe output
    if (prompt === 'unsafe_app') {
        result = { ...result, hack: 'fail_me' };
    }

    // 🛡️ Guardian Angel Audit 🛡️
    logger.info('👼 Guardian Angel is auditing the generated code...');
    const codeForAudit = JSON.stringify(result, null, 2);
    const auditResult = await GuardianService.auditCode(codeForAudit, 'Genesis App Generation');

    if (!auditResult.safe) {
        logger.error(`👼 Guardian Internal Block: ${auditResult.reasoning}`);
        throw new Error(`Guardian Angel Blocked Generation: ${auditResult.reasoning}`);
    }

    logger.info(`👼 Guardian Approved (Score: ${auditResult.score})`);
    return result;
};

// Run Tests
const runTests = async () => {
    console.log('🧪 Starting Generator-Guardian Integration Tests...\n');

    // Test 1: Safe App
    try {
        console.log('Test 1: Safe App Generation');
        await generateApp('safe_app');
        console.log('✅ Passed: Safe app was approved.\n');
    } catch (error) {
        console.error('❌ Failed: Safe app was blocked.', error);
    }

    // Test 2: Unsafe App
    try {
        console.log('Test 2: Unsafe App Generation');
        await generateApp('unsafe_app');
        console.error('❌ Failed: Unsafe app was NOT blocked.\n');
    } catch (error) {
        if (error.message.includes('Guardian Angel Blocked Generation')) {
            console.log('✅ Passed: Unsafe app was correctly blocked.\n');
        } else {
            console.error('❌ Failed: Unexpected error.', error);
        }
    }
};

runTests();
