const fs = require('fs');
const file = 'c:/Users/hyper/Desktop/workspace/alti.code.studio/alti.code.studio.frontend/components/agents/MissionControl.tsx';
let data = fs.readFileSync(file, 'utf8');

const target = `    socket.on(
      "mission:complete",`;

const replacement = `    // OpenTelemetry Real-Time Streams
    socket.on("span_started", (data: { spanId: string; name: string; attributes: any }) => {
       appendStep({
           agent: data.attributes?.agent || "AI Swarm",
           status: "running",
           output: \`[Span: \${data.name}] Started executing sub-routine.\`,
       });
    });

    socket.on("span_ended", (data: { spanId: string; name: string; success: boolean, timestamp: number }) => {
       appendStep({
           agent: "System",
           status: data.success ? "success" : "failed",
           output: \`[Span: \${data.name}] Concluded\${data.success ? ' successfully' : ' with errors'}.\`,
       });
    });

    socket.on(
      "mission:complete",`;

// Handle both CRLF and LF safely
data = data.replace(target.replace(/\n/g, "\r\n"), replacement);
data = data.replace(target, replacement);

fs.writeFileSync(file, data, 'utf8');
console.log('Patched');
