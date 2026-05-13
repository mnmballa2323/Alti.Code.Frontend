/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { authRoutes } from '../modules/auth/auth.route.js';
import swaggerUi from 'swagger-ui-express';
import { specs } from '../../config/swagger.js';
// import { subscriptionRoutes } from '../modules/payment/payment.route.js';
// import { serperAiRoutes } from '../modules/serper/serper.route.js';
import { adminRoutes } from '../modules/admin/admin.route.js';
// import { dyadAiRoutes } from '../modules/dyad/dyad.route.js';
// import { geminiOpenMemoryAiRoutes } from '../modules/geminiOpenMemory/geminiOpenMemo.route.js';
// import { codeEditorRoutes } from '../modules/codeEditor/codeEditor.route.js';
// import { cyberdeskRoutes } from '../modules/cyberdesk/cyberdesk.route.js';
// import { geminiCliRoutes } from '../modules/geminiCli/geminiCli.route.js';
// import { llamaindexRoutes } from '../modules/llamaindex/llamaindex.route.js';
import { openAiRoutes } from '../modules/openAiAgent/openAiAgent.router.js';
// import { openSWERoutes } from '../modules/openSWE/openswe.route.js';
// import { parsrRoutes } from '../modules/parsr/parsr.route.js';
// import { geminiAiRoutes } from '../modules/gemini/gemini.route.js';
import { securityAgentRoutes } from '../modules/securityAgent/securityAgent.route.js';
import { refactorAgentRoutes } from '../modules/refactorAgent/refactorAgent.route.js';
import { debugAgentRoutes } from '../modules/debugAgent/debugAgent.route.js';
import { devOpsAgentRoutes } from '../modules/devOpsAgent/devOpsAgent.route.js';
import { ciCdAgentRoutes } from '../modules/ciCdAgent/ciCdAgent.route.js';
import { iacAgentRoutes } from '../modules/iacAgent/iacAgent.route.js';
import { shadowWorkspaceRoutes } from '../modules/shadowWorkspace/shadowWorkspace.route.js';
import { generatorRoutes } from '../modules/generator/generator.route.js';
import { harnessRoutes } from '../modules/harness/harness.route.js';

import { synapseRoutes } from '../modules/synapse/synapse.route.js';
import { gitAgentRoutes } from '../modules/gitAgent/gitAgent.route.js';
import { mcpRoutes } from '../modules/mcp/mcp.route.js';
import { guardianRoutes } from '../modules/guardian/guardian.route.js';
import { integrationRoutes } from '../modules/integrations/integration.route.js';
import { ComplianceRoutes } from '../modules/governance/compliance.route.js';
import { AnalystRoutes } from '../modules/analytics/analyst.route.js';
import { AuditRoutes } from '../modules/audit/audit.route.js';
// import { flowiseRoutes } from '../modules/flowise/flowise.route.js';

const router = express.Router();

import { orchestratorRoutes } from '../modules/agents/orchestrator.route.js';
import { AgentRoutes } from '../modules/agents/agent.route.js';
// Docs
import { DocsRoutes } from '../modules/docs/docs.route.js';
// Enterprise (Phases 26-35)
import enterpriseRoutes from '../modules/enterprise/enterprise.routes.js';

const moduleRoutes = [
  {
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/agents',
    route: AgentRoutes,
  },
  {
    path: '/orchestrator',
    route: orchestratorRoutes,
  },
  {
    path: '/enterprise',
    route: enterpriseRoutes,
  },
  {
    path: '/git-agent',
    route: gitAgentRoutes,
  },

  // {
  //   path: '/parsr',
  //   route: parsrRoutes,
  // },
  // {
  //   path: '/open-swe',
  //   route: openSWERoutes,
  // },
  // {
  //   path: '/subscription',
  //   route: subscriptionRoutes,
  // },
  // {
  //   path: '/cyberdesk',
  //   route: cyberdeskRoutes,
  // },
  // {
  //   path: '/rag-system',
  //   route: llamaindexRoutes,
  // },
  // {
  //   path: '/code-editor',
  //   route: codeEditorRoutes,
  // },
  // {
  //   path: '/dyad/claude',
  //   route: dyadAiRoutes,
  // },
  // {
  //   path: '/gemini-cli',
  //   route: geminiCliRoutes,
  // },
  {
    path: '/openai',
    route: openAiRoutes,
  },
  // {
  //   path: '/gemini',
  //   route: geminiAiRoutes,
  // },
  {
    path: '/security-agent',
    route: securityAgentRoutes,
  },
  {
    path: '/refactor-agent',
    route: refactorAgentRoutes,
  },
  {
    path: '/debug-agent',
    route: debugAgentRoutes,
  },
  {
    path: '/devops-agent',
    route: devOpsAgentRoutes,
  },
  {
    path: '/ci-cd-agent',
    route: ciCdAgentRoutes,
  },
  {
    path: '/iac-agent',
    route: iacAgentRoutes,
  },
  {
    path: '/shadow',
    route: shadowWorkspaceRoutes,
  },
  {
    path: '/generator',
    route: generatorRoutes,
  },
  {
    path: '/harness',
    route: harnessRoutes,
  },

  {
    path: '/synapse',
    route: synapseRoutes,
  },
  {
    path: '/git-agent',
    route: gitAgentRoutes,
  },
  {
    path: '/mcp',
    route: mcpRoutes,
  },
  {
    path: '/guardian',
    route: guardianRoutes,
  },
  {
    path: '/integrations',
    route: integrationRoutes,
  },
  {
    path: '/governance',
    import express from 'express';
    import { authRoutes } from '../modules/auth/auth.route.js';
    import swaggerUi from 'swagger-ui-express';
    import { specs } from '../../config/swagger.js';
    // import { subscriptionRoutes } from '../modules/payment/payment.route.js';
    // import { serperAiRoutes } from '../modules/serper/serper.route.js';
    import { adminRoutes } from '../modules/admin/admin.route.js';
    // import { dyadAiRoutes } from '../modules/dyad/dyad.route.js';
    // import { geminiOpenMemoryAiRoutes } from '../modules/geminiOpenMemory/geminiOpenMemo.route.js';
    // import { codeEditorRoutes } from '../modules/codeEditor/codeEditor.route.js';
    // import { cyberdeskRoutes } from '../modules/cyberdesk/cyberdesk.route.js';
    // import { geminiCliRoutes } from '../modules/geminiCli/geminiCli.route.js';
    // import { llamaindexRoutes } from '../modules/llamaindex/llamaindex.route.js';
    import { openAiRoutes } from '../modules/openAiAgent/openAiAgent.router.js';
    // import { openSWERoutes } from '../modules/openSWE/openswe.route.js';
    // import { parsrRoutes } from '../modules/parsr/parsr.route.js';
    // import { geminiAiRoutes } from '../modules/gemini/gemini.route.js';
    import { securityAgentRoutes } from '../modules/securityAgent/securityAgent.route.js';
    import { refactorAgentRoutes } from '../modules/refactorAgent/refactorAgent.route.js';
    import { debugAgentRoutes } from '../modules/debugAgent/debugAgent.route.js';
    import { devOpsAgentRoutes } from '../modules/devOpsAgent/devOpsAgent.route.js';
    import { ciCdAgentRoutes } from '../modules/ciCdAgent/ciCdAgent.route.js';
    import { iacAgentRoutes } from '../modules/iacAgent/iacAgent.route.js';
    import { shadowWorkspaceRoutes } from '../modules/shadowWorkspace/shadowWorkspace.route.js';
    import { generatorRoutes } from '../modules/generator/generator.route.js';
    import { harnessRoutes } from '../modules/harness/harness.route.js';

    import { synapseRoutes } from '../modules/synapse/synapse.route.js';
    import { gitAgentRoutes } from '../modules/gitAgent/gitAgent.route.js';
    import { mcpRoutes } from '../modules/mcp/mcp.route.js';
    import { guardianRoutes } from '../modules/guardian/guardian.route.js';
    import { integrationRoutes } from '../modules/integrations/integration.route.js';
    import { ComplianceRoutes } from '../modules/governance/compliance.route.js';
    import { AnalystRoutes } from '../modules/analytics/analyst.route.js';
    // import { flowiseRoutes } from '../modules/flowise/flowise.route.js';
    import { AuditRoutes } from '../modules/audit/audit.route.js';

    const router = express.Router();

    import { orchestratorRoutes } from '../modules/agents/orchestrator.route.js';
    import { AgentRoutes } from '../modules/agents/agent.route.js';
    // Docs
    import { DocsRoutes } from '../modules/docs/docs.route.js';

    const moduleRoutes = [
      {
        path: '/admin',
        route: adminRoutes,
      },
      {
        path: '/auth',
        route: authRoutes,
      },
      {
      //   route: parsrRoutes,
      // },
      // {
      //   path: '/open-swe',
      //   route: openSWERoutes,
      // },
      // {
      //   path: '/subscription',
      //   route: subscriptionRoutes,
      // },
      // {
      //   path: '/cyberdesk',
      //   route: cyberdeskRoutes,
      // },
      // {
      //   path: '/rag-system',
      //   route: llamaindexRoutes,
      // },
      // {
      //   path: '/code-editor',
      //   route: codeEditorRoutes,
      // },
      // {
      //   path: '/dyad/claude',
      //   route: dyadAiRoutes,
      // },
      // {
      //   path: '/gemini-cli',
      //   route: geminiCliRoutes,
      // },
      {
        path: '/openai',
        route: openAiRoutes,
      },
      // {
      //   path: '/gemini',
      //   route: geminiAiRoutes,
      // },
      {
        path: '/security-agent',
        route: securityAgentRoutes,
      },
      {
        path: '/refactor-agent',
        route: refactorAgentRoutes,
      },
      {
        path: '/debug-agent',
        route: debugAgentRoutes,
      },
      {
        path: '/devops-agent',
        route: devOpsAgentRoutes,
      },
      {
        path: '/ci-cd-agent',
        route: ciCdAgentRoutes,
      },
      {
        path: '/iac-agent',
        route: iacAgentRoutes,
      },
      {
        path: '/shadow',
        route: shadowWorkspaceRoutes,
      },
      {
        path: '/generator',
        route: generatorRoutes,
      },
      {
        path: '/harness',
        route: harnessRoutes,
      },

      {
        path: '/synapse',
        route: synapseRoutes,
      },
      {
        path: '/git-agent',
        route: gitAgentRoutes,
      },
      {
        path: '/mcp',
        route: mcpRoutes,
      },
      {
        path: '/guardian',
        route: guardianRoutes,
      },
      {
        path: '/integrations',
        route: integrationRoutes,
      },
      {
        path: '/governance',
        route: ComplianceRoutes,
      },
      {
        path: '/analyst',
        route: AnalystRoutes,
      },
      {
        path: '/api-docs', // Using the route module instead of direct swaggerUi
        route: DocsRoutes,
      },
      {
        path: '/audit',
        route: AuditRoutes,
      }
    ];

    moduleRoutes.forEach(route => router.use(route.path, route.route));

    // router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

    export default router;
