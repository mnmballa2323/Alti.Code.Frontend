import { treeSitterService } from './src/app/modules/refactorAgent/treeSitter.service.js';

const runTest = async () => {
    console.log('🌲 Testing Tree-sitter Service (WASM)...');

    try {
        await treeSitterService.init();

        const code = `
            function hello() {
                return 1;
            }
            class World {
                greet() {}
            }
        `;

        // 1. Parsing
        console.log('Step 1: Parsing Code...');
        const tree = await treeSitterService.parse(code, 'javascript');
        console.log('✅ Parsed. Root node type:', tree.rootNode.type); // "program"

        // 2. Querying
        console.log('Step 2: Querying for Functions and Classes...');
        // Query for function and class declarations
        const queryString = `
            (function_declaration name: (identifier) @funcName)
            (class_declaration name: (identifier) @className)
        `;

        const matches = await treeSitterService.query(code, queryString, 'javascript');
        console.log(`✅ Found ${matches.length} matches.`);

        matches.forEach(match => {
            match.captures.forEach(c => {
                console.log(`   - Capture [${c.name}]: ${c.node.text}`);
            });
        });

        // Validation
        const foundHello = matches.some(m => m.captures.some(c => c.name === 'funcName' && c.node.text === 'hello'));
        const foundWorld = matches.some(m => m.captures.some(c => c.name === 'className' && c.node.text === 'World'));

        if (foundHello && foundWorld) {
            console.log('🎉 Tree-sitter Verification Passed');
            process.exit(0);
        } else {
            console.error('❌ Query results mismatch. Expected "hello" and "World"');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
};

runTest();
