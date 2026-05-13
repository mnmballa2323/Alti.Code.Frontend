import { capabilityRouter } from './src/app/modules/agents/capability.router.js';

async function runTests() {
    console.log("=========================================");
    console.log("🧪 DEEP SYSTEMS & CRYPTOGRAPHY ROUTING TEST");
    console.log("=========================================\n");

    const tests = [
        {
            name: "ZK Protocol Architect",
            prompt: "Please scaffold a Circom circuit for a Poseidon hash function inside an R1CS constraint system. I need to generate groth16 proofs.",
            expected: "Zero_Knowledge_Protocol_Architect"
        },
        {
            name: "Post-Quantum Migration",
            prompt: "I need to migrate my TLS endpoints to use CRYSTALS-Kyber key encapsulation and Dilithium signatures. Generate the C bindings for liboqs.",
            expected: "Post_Quantum_Migration_Specialist"
        },
        {
            name: "Consensus Protocol",
            prompt: "Write a Raft state machine replication loop in Rust. It needs leader election, heartbeats, and handling split brain partitions with a 2f+1 quorum.",
            expected: "Consensus_Protocol_Engineer"
        },
        {
            name: "Gossip & DHT Networking",
            prompt: "Build me a Kademlia distributed hash table logic with an XOR distance metric. Also include epidemic routing for anti-entropy sync.",
            expected: "Gossip_DHT_Networking_Architect"
        },
        {
            name: "Database Storage Engine",
            prompt: "Scaffold an LSM tree storage engine. I need an in-memory skip list memtable, compaction logic for SSTables, and an ARIES write-ahead log.",
            expected: "Storage_Engine_LSM_Tree_Architect"
        },
        {
            name: "Database Query Optimizer",
            prompt: "Generate a cost-based optimizer for my SQL parser. Implement dynamic programming for join orderings and AST rewrite rules. Also need HNSW vector search.",
            expected: "Query_Optimizer_Vector_DB_Architect"
        },
        {
            name: "TinyML Edge Inference",
            prompt: "I want to run this PyTorch model on a Cortex-M MCU. Write the script for INT8 post-training quantization and generate the CMSIS-NN C code.",
            expected: "TinyML_Edge_Inference_Optimizer"
        }
    ];

    let passed = 0;
    for (const test of tests) {
        const agent = capabilityRouter.route(test.prompt);
        if (agent.name === test.expected) {
            console.log(`✅ PASS: [${test.name}] routed correctly to -> ${agent.name}`);
            passed++;
        } else {
            console.log(`❌ FAIL: [${test.name}] routed to -> ${agent.name} (Expected: ${test.expected})`);
        }
    }

    console.log("\n=========================================");
    console.log(`RESULTS: ${passed} / ${tests.length} tests passed.`);
    console.log("=========================================");

    if (passed !== tests.length) {
        process.exit(1);
    }
}

runTests().catch(console.error);
