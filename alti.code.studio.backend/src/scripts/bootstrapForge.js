// Fix tink-crypto global scope issue in Node.js ES Modules
global.self = global;

// Dynamically import the main daemon script so globals are set before dependency tree loads
import('./infiniteAgentForge.js').catch(error => {
    console.error("Fatal error starting the Infinite Forge:", error);
    process.exit(1);
});
