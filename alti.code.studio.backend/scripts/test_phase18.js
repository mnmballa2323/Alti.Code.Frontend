
console.log("🚀 Starting Phase 18 Verification...");

try {
    console.log("1. Importing Synapse Service...");
    const { SynapseService } = await import('../src/app/modules/synapse/synapse.service.js');
    console.log("✅ Synapse Imported.");

    // Register agents to populate the internal mockRegistry
    console.log("2. Registering Mock Agents...");
    await SynapseService.registerAgent('Sentinel', ['security', 'audit'], 'http://mock/sentinel');
    await SynapseService.registerAgent('Refactor', ['refactor', 'cleanup'], 'http://mock/refactor');
    await SynapseService.registerAgent('Composer', ['write', 'edit'], 'http://mock/composer');
    console.log("✅ Agents Registered.");

    console.log("2. Importing Hive Control...");
    const { hiveControl } = await import('../src/app/modules/agents/hive.control.js');
    console.log("✅ Hive Control Imported.");

    console.log("\n🐝 Testing Swarm Formation...");

    // We need 'security' and 'refactor' agents
    const session = await hiveControl.startSession(
        "Fix Security Vulnerabilities",
        ['security', 'refactor']
    );

    console.log("Swarm Session:", JSON.stringify(session, null, 2));

    if (!session.squad.includes('Sentinel') || !session.squad.includes('Refactor')) {
        throw new Error("Swarm failed to recruit correct agents via Capabilities.");
    }

    console.log("✅ Swarm Squad successfully assembled.");


    // --- TEST 2: HIVE LOGGING ---
    console.log("\n🕸️ Testing Hive State Tracking...");

    hiveControl.logAction(session.id, 'Sentinel', 'Detected SQL Injection in user.controller.js');
    hiveControl.logAction(session.id, 'Refactor', 'Applied parameterized query fix');

    const updatedSession = hiveControl.getSession(session.id);
    console.log("Session Logs:", updatedSession.logs);

    if (updatedSession.logs.length !== 2) throw new Error("Hive Control failed to log actions.");

    console.log("✅ Hive Control tracking valid.");

    console.log("\n✅ Phase 18 Verified Successfully!");

} catch (error) {
    console.error("❌ Verification Failed:", error);
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
        console.error("💡 Module Path Error. Check your relative paths.");
    }
    process.exit(1);
}
