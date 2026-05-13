import { capabilityRouter } from './src/app/modules/agents/capability.router.js';

async function runTests() {
    console.log("=========================================");
    console.log("🧪 SOVEREIGN INFRASTRUCTURE AGENT ROUTING TEST");
    console.log("=========================================\n");

    const prompts = [
        {
            name: "Aerospace Avionics Test",
            prompt: "I need you to write a DO-178C compliant C parser for an ARINC 429 aviation data bus. It must have zero memory allocation.",
            expected: "Avionics_Flight_Control_Architect"
        },
        {
            name: "Space Telemetry Test",
            prompt: "Scaffold a Python script to decode a CCSDS space packet payload and run an SGP4 orbital dynamics propagation.",
            expected: "Satellite_Telemetry_Dynamics_Specialist"
        },
        {
            name: "Energy Smart Grid Test",
            prompt: "Generate an IEC 61850 GOOSE messaging client in Rust for substation protection relayed over a DNP3 microgrid.",
            expected: "Smart_Grid_Substation_Automator"
        },
        {
            name: "Telecom 5G Core Test",
            prompt: "I need an eBPF packet inspection data-plane written in C for a 3GPP 5G Core UPF interface, handling O-RAN.",
            expected: "Telecom_5G_Network_Architect"
        },
        {
            name: "Logistics EDI Test",
            prompt: "Write a Node.js parser for an ANSI X12 856 ASN document. It needs to eventually send signals to a WCS PLC divert conveyor.",
            expected: "Global_Logistics_Automation_Specialist"
        },
        {
            name: "Digital Forensics Test",
            prompt: "Create an immutable, tamper-evident cryptographic chain of custody ledger using Ed25519 for an e-discovery SOC2 PII redaction pipeline.",
            expected: "Digital_Forensics_Auditor"
        },
        {
            name: "GovTech Security Test",
            prompt: "Generate a Terraform module and Kubernetes manifests asserting NIST SP 800-53 controls for a FedRAMP IL5 zero-trust environment using FIPS 140-3 BoringCrypto.",
            expected: "Defense_GovTech_Security_Architect"
        }
    ];

    let passed = 0;

    for (const test of prompts) {
        process.stdout.write("Testing '" + test.name + "'... ");
        try {
            const result = capabilityRouter.route(test.prompt);
            const agentName = result.agent.name;

            if (agentName === test.expected) {
                console.log("✅ PASSED (Routed to: " + agentName + ")");
                passed++;
            } else {
                console.log("❌ FAILED (Routed to: " + agentName + ", Expected: " + test.expected + ")");
            }
        } catch (e) {
            console.log("❌ FAILED (Error: " + e.message + ")");
        }
    }

    console.log("\n=========================================");
    console.log("🏁 RESULTS: " + passed + " / " + prompts.length + " TESTS PASSED");
    console.log("=========================================\n");
}

runTests();
