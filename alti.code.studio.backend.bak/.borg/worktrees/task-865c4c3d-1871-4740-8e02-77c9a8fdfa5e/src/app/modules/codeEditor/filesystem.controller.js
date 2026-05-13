/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { filesystemTool } from '../mcp/tools/filesystem.tool.js';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';

const handleFsAction = catchAsync(async (req, res) => {
    const { action, path, content } = req.body;

    // Reuse the MCP tool logic for consistency and security
    // The tool expects an object { action, path, content }
    try {
        const result = await filesystemTool.handler({ action, path, content });

        // Parse the tool output format back to simple JSON for the frontend
        // Tool returns: { content: [{ type: 'text', text: ... }] }
        let data = result.content[0].text;

        // If listing directory, parse the JSON string back to object
        if (action === 'list_directory') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                // keep as string if parse fails
            }
        }

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: `FS Action ${action} successful`,
            data: data
        });

    } catch (error) {
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: error.message,
            data: null
        });
    }
});

export const FileSystemController = {
    handleFsAction
};
