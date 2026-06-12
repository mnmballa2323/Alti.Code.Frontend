/**
 * Copyright (c) 2026 Inso Code
 * 
 * Middleware bridging to the shared platform tenant database router.
 * Maintains backwards compatibility for Inso Code routes.
 */

import { tenantDbRouter } from '../platform/db/tenantDbRouter.js';

export { tenantDbRouter };
export default tenantDbRouter;
