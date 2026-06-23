/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { AuditLog } from './audit.model.js';
import { azureGenAiService as AzureGenAiService } from '../ai/azureGenAi.service.js';
import { lighthouseService } from './lighthouse.service.js';
import { genkitService } from '../genkit/genkit.service.js';

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

const analyzeLogs = catchAsync(async (req, res) => {
    const { query } = req.body;
    
    // Fetch last 50 logs for context
    const recentLogs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(50);
    const logContext = JSON.stringify(recentLogs);

    const model = AzureGenAiService.getGenerativeModel(AzureGenAiService.PRIMARY_MODEL, 0.2);
    
    const prompt = `
        You are the Inso Code Forensic Security AI, powered by Google Vertex AI.
        Analyze the following recent audit logs and respond to the user's query.
        
        Recent Logs:
        ${logContext}
        
        Query: ${query}
        
        Respond with a highly professional, detailed forensic analysis in markdown format. 
        Highlight any anomalies, unauthorized access attempts, or compliance violations.
    `;
    
    const result = await model.generateContent(prompt);
    const analysis = result.response.candidates[0].content.parts[0].text;

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Forensic AI analysis completed successfully',
        data: { analysis },
    });
});

const runLighthouseAudit = catchAsync(async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'URL is required for Lighthouse Audit.' });
    }
    
    const result = await lighthouseService.executeAudit(url);
    
    if (!result.success) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: result.error });
    }
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Lighthouse Audit completed successfully.',
        data: result,
    });
});

const runGenkitAudit = catchAsync(async (req, res) => {
    const { codeSnippet, language } = req.body;
    
    if (!codeSnippet) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'codeSnippet required for Genkit audit' });
    }
    
    const result = await genkitService.runCodeAudit(codeSnippet, language);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Genkit AI Audit Flow executed successfully',
        data: result,
    });
});

export const AuditController = {
    getLogs,
    exportLogsToGCS,
    analyzeLogs,
    runLighthouseAudit,
    runGenkitAudit
};
