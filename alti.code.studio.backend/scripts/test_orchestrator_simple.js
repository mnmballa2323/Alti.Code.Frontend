
import { orchestratorAgent } from '../src/app/modules/agents/orchestrator.agent.js';
console.log('Orchestrator imported successfully');
import { auditService } from '../src/app/modules/audit/audit.service.js';
console.log('AuditService imported successfully');
// import { SecurityAgentService } from '../src/app/modules/securityAgent/securityAgent.service.js';
// console.log('SecurityAgentService imported successfully');

try {
    console.log(orchestratorAgent);
} catch (e) {
    console.error(e);
}
