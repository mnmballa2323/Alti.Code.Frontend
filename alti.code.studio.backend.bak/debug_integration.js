
try {
    console.log('Test: Importing Orchestrator...');
    const { orchestratorAgent } = await import('./src/app/modules/agents/orchestrator.agent.js');
    console.log('Test: Import Success.');

    console.log('Test: Executing Simple Plan...');
    const result = await orchestratorAgent.execute("Create a file called debug.txt");
    console.log('Test: Result:', result.status);

} catch (error) {
    console.error('Test Failed:', error);
}
