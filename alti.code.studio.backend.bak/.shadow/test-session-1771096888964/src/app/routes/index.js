import express from 'express';
import { authRoutes } from '../modules/auth/auth.route.js';
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
// import { flowiseRoutes } from '../modules/flowise/flowise.route.js';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
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
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
