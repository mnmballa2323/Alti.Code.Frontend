/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { AuditLog } from './audit.model.js';

const getLogs = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Enterprise Dashboard default
    const skip = (page - 1) * limit;

    const { actor, action, status, from, to } = req.query;

    const query = {};

    if (actor) query.actor = { $regex: actor, $options: 'i' };
    if (action) query.action = { $regex: action, $options: 'i' };
    if (status) query.status = status;

    if (from || to) {
        query.timestamp = {};
        if (from) query.timestamp.$gte = new Date(from);
        if (to) query.timestamp.$lte = new Date(to);
    }

    // Default Sort: Newest First (The standard for security logs)
    const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

    const total = await AuditLog.countDocuments(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audit logs retrieved successfully',
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
        data: logs,
    });
});

const exportLogsToGCS = catchAsync(async (req, res) => {
    const { from, to, tenantId, severity, actor } = req.body || {};

    // We import dynamically to avoid circular dependencies if enterprise module isn't strictly loaded
    const { auditExporter } = await import('../enterprise/audit.exporter.js');

    const result = await auditExporter.exportToGCSWorm({
        from, to, tenantId, severity, actor
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Audit logs exported to WORM securely',
        data: result,
    });
});

export const AuditController = {
    getLogs,
    exportLogsToGCS
};
