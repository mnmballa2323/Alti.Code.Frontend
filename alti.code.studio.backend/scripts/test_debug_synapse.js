
try {
    console.log("Importing Synapse directly...");
    const { SynapseService } = await import('../src/app/modules/synapse/synapse.service.js');
    console.log("✅ Synapse Imported:", Object.keys(SynapseService));
} catch (e) {
    console.error("❌ Synapse Import Failed:", e);
}
