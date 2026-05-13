import { codeMorphService } from './src/app/modules/refactorAgent/codeMorph.service.js';

const runTest = async () => {
    console.log('🧪 Testing ts-morph Integration...');

    try {
        // 1. Create a dummy file in memory
        const dummyCode = `
class TestAgent {
    constructor() {
        this.name = 'Test';
    }
}
export default TestAgent;
        `;

        const sourceFile = codeMorphService.project.createSourceFile('dummy.ts', dummyCode, { overwrite: true });
        console.log('📄 Original Code:\n', sourceFile.getFullText());

        // 2. Add Import
        console.log('Step 2: Adding Import...');
        codeMorphService.addImport(sourceFile, 'fs', ['readFileSync']);

        // 3. Add Method
        console.log('Step 3: Adding Class Method...');
        codeMorphService.addClassMethod(sourceFile, 'TestAgent', 'log', 'console.log("Hello from AST!");');

        // 4. Verify Output
        const modifiedCode = sourceFile.getFullText();
        console.log('📝 Modified Code:\n', modifiedCode);

        if (modifiedCode.includes('import { readFileSync } from \'fs\';') && modifiedCode.includes('log()')) {
            console.log('✅ AST Transformation Success');
            process.exit(0);
        } else {
            console.error('❌ AST Transformation Failed: Code not matching expectations');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
};

runTest();
