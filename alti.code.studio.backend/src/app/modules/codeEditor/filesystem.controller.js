/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { filesystemTool } from '../mcp/tools/filesystem.tool.js';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';

const handleFsAction = catchAsync(async (req, res) => {
    const { action, path, content } = req.body;

    if (!action || typeof action !== 'string') {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'action is required (non-empty string)',
            data: null,
        });
    }
    if (!path || typeof path !== 'string') {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'path is required (non-empty string)',
            data: null,
        });
    }

    // Reuse the MCP tool logic for consistency and security
    try {
        const result = await filesystemTool.handler({ action, path, content });

        // Guard: tool should always return content array but be defensive
        // Tool returns: { content: [{ type: 'text', text: ... }] }
        const rawText = result?.content?.[0]?.text ?? '';
        let data = rawText;

        // If listing directory, parse the JSON string back to object
        if (action === 'list_directory') {
            try {
                data = JSON.parse(rawText);
            } catch {
                // keep as string if parse fails
            }
        }

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: `FS Action ${action} successful`,
            data,
        });

    } catch (error) {
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: error.message,
            data: null,
        });
    }
});

export const FileSystemController = {
    handleFsAction
};
