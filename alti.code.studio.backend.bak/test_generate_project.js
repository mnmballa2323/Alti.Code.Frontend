// Mocks
const mockProjectResponse = {
    choices: [{
        message: {
            content: JSON.stringify({
                files: [
                    { path: 'package.json', content: '{"name": "test-project"}' },
                    { path: 'src/App.jsx', content: 'export default function App() { return <h1>Hello</h1> }' },
                    { path: 'vite.config.js', content: 'export default {}' }
                ]
            })
        }
    }]
};

const mockGuardianApproved = {
    safe: true,
    score: 98,
    reasoning: "Safe project structure"
};

// Mocking dependencies
const config = { openai_api_key: 'test-key' };
const logger = {
    info: (msg) => console.log('INFO:', msg),
    error: (msg) => console.log('ERROR:', msg),
    warn: (msg) => console.log('WARN:', msg)
};

const GuardianService = {
    auditCode: async (code) => {
        console.log('Guardian Project Audit...', code.length, 'chars');
        return mockGuardianApproved;
    }
};

class OpenAI {
    constructor() {
        this.chat = {
            completions: {
                create: async () => mockProjectResponse
            }
        };
    }
}

// Re-implementing generateProject for standalone testing
const generateProject = async (prompt, type = 'react') => {
    logger.info(`Generating ${type} project from prompt: ${prompt}`);

    // Call OpenAI (Mocked)
    const openai = new OpenAI();
    const response = await openai.chat.completions.create({});
    let result = JSON.parse(response.choices[0].message.content);

    // 🛡️ Guardian Angel Audit 🛡️
    logger.info('👼 Guardian Angel is auditing the generated project...');
    const codeForAudit = JSON.stringify(result, null, 2);
    const auditResult = await GuardianService.auditCode(codeForAudit, `Genesis Project Generation (${type})`);

    if (!auditResult.safe) {
        logger.error(`👼 Guardian Internal Block: ${auditResult.reasoning}`);
        throw new Error(`Guardian Angel Blocked Generation: ${auditResult.reasoning}`);
    }

    logger.info(`👼 Guardian Approved (Score: ${auditResult.score})`);
    return result;
};

// Run Test
const runTest = async () => {
    console.log('🧪 Starting Multi-File Generation Test...\n');
    try {
        const project = await generateProject('Create a React dashboard', 'react');

        console.log('Files generated:');
        project.files.forEach(f => console.log(`- ${f.path}`));

        if (project.files.some(f => f.path === 'package.json') &&
            project.files.some(f => f.path === 'src/App.jsx')) {
            console.log('\n✅ Passed: Project structure contains expected files.');
        } else {
            console.error('\n❌ Failed: Missing expected files.');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
};

runTest();
