import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { workspaceAdminService } from './workspaceAdmin.service.js';

const provisionAccount = catchAsync(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'firstName, lastName, email, and password are required.' });
    }

    const account = await workspaceAdminService.provisionDeveloperAccount(firstName, lastName, email, password);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Google Workspace Developer Account provisioned autonomously.',
        data: { account },
    });
});

const suspendAccount = catchAsync(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'email is required.' });
    }

    const result = await workspaceAdminService.suspendDeveloperAccount(email);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Workspace Developer Account suspended.',
        data: result,
    });
});

export const WorkspaceAdminController = {
    provisionAccount,
    suspendAccount
};
