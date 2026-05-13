import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { recaptchaService } from './recaptcha.service.js';

const assessRisk = catchAsync(async (req, res) => {
    const { token, recaptchaAction } = req.body;
    
    if (!token || !recaptchaAction) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'token and recaptchaAction are required.' });
    }

    const score = await recaptchaService.createAssessment(token, recaptchaAction);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google reCAPTCHA Enterprise risk assessment completed.',
        data: { score },
    });
});

export const RecaptchaController = {
    assessRisk
};
