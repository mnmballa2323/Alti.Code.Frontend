/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import bcrypt from 'bcryptjs';
import formData from 'form-data';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../../../config/index.js';
import ApiError from '../../../errors/ApiError.js';
import { catchAsync } from '../../../shared/catchAsync.js';
import { logger } from '../../../shared/logger.js';
import sendResponse from '../../../shared/sendResponse.js';
import UserModel from './auth.model.js';
import { authService } from './auth.service.js';
import {
  generateOTP,
} from './auth.utils.js';
import { recaptchaService } from '../googleCloud/recaptcha.service.js';
import { kmsService } from '../googleCloud/kms.service.js';

// Mailgun has been purged. 
// @todo: Implement Google Workspace / Gmail API via GCP Service Accounts for transactional emails.
const sendMailWithGoogleWorkspace = async (mailData) => {
    logger.info(`[GCP Identity] Simulating transactional email to ${mailData.to} via Google Workspace API`);
    return { success: true };
};

const register = catchAsync(async (req, res) => {
  const { recaptchaToken } = req.body;
  if (recaptchaToken) {
      const riskScore = await recaptchaService.createAssessment(recaptchaToken, 'register');
      if (riskScore < 0.7) {
          throw new ApiError(httpStatus.FORBIDDEN, `Google reCAPTCHA Enterprise: Automated bot detected (Score: ${riskScore})`);
      }
  }

  const result = await authService.registerService(req);
  logger.info(`User registered successfully: ${req.body.email}`);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const confirmEmail = catchAsync(async (req, res) => {
  const { token } = req.params;
  const result = await authService.confirmEmailService(token);
  if (result instanceof ApiError) {
    // If an ApiError is returned, handle it as an error response
    return sendResponse(res, {
      statusCode: result.statusCode,
      success: false,
      message: result.message,
    });
  }

  // If no error, redirect to the URL
  res.status(302).redirect('https://www.insocode.com');
});

const login = catchAsync(async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  if (recaptchaToken) {
      const riskScore = await recaptchaService.createAssessment(recaptchaToken, 'login');
      if (riskScore < 0.7) {
          throw new ApiError(httpStatus.FORBIDDEN, `Google reCAPTCHA Enterprise: Automated bot detected (Score: ${riskScore})`);
      }
  }

  // logger.info(`Login attempt for: ${email}`); // safe to log email, but not password
  const result = await authService.loginService(email, password);

  if (result.mfaRequired) {
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'MFA Verification Required',
      data: {
        mfaRequired: true,
        mfaToken: result.mfaToken,
      },
    });
  }

  const { refreshToken, ...others } = result;

  // Set Refresh Token into cookie
  const cookieOption = {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict',
  };
  res.cookie('refreshToken', refreshToken, cookieOption);

  logger.info(`User logged in: ${email}`);

  // KMS Encrypt the payload before sending to client
  const encryptedPayload = await kmsService.encryptPayload(JSON.stringify(others));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login Successfully',
    data: {
      encryptedPayload,
      ...others // We keep others for backward compatibility right now, ideally we only send the encrypted string
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  const result = await authService.refreshToken(refreshToken);

  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully !',
    data: result,
  });
});

const forgetPassword = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email: email }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ error: 'You entered the wrong email' });
    }

    const OTP = await generateOTP();
    const OTPExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    user.resetPasswordOTP = OTP;
    user.resetPasswordExpires = OTPExpiration;
    await user.save({ session });

    const mailData = { to: email, subject: 'Password Reset', body: `OTP: ${OTP}` };
    await sendMailWithGoogleWorkspace(mailData);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'Success',
      message: 'OTP sent successfully!',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Forget Password Error:", error);
    res.status(500).send({ error: 'Something went wrong!' });
  }
};

const resetPassword = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, otp, newPassword } = req.body;
    const user = await UserModel.findOne({ email: email }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ error: 'You entered the wrong email' });
    }

    if (user.resetPasswordOTP !== otp || !user.resetPasswordOTP) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({ error: 'Invalid OTP' });
    }

    if (Date.now() > user.resetPasswordExpires) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({ error: 'OTP expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({ message: 'Password updated successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Reset Password Error:", error);
    res.status(500).send({ error: 'An error occurred' });
  }
};

const deleteUserAccountOTP = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.params?.id;

    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ error: 'Invalid user ID' });
    }

    const user = await UserModel.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(httpStatus.NOT_FOUND).send({ error: 'User not found' });
    }

    const OTP = await generateOTP();
    const OTPExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    user.deleteAccountOTP = OTP;
    user.deleteAccountExpires = OTPExpiration;
    await user.save({ session });

    const mailData = { to: user.email, subject: 'Delete Account', body: `OTP: ${OTP}` };
    await sendMailWithGoogleWorkspace(mailData);

    await session.commitTransaction();
    session.endSession();

    res.status(httpStatus.OK).json({
      status: 'Success',
      message: 'Delete account OTP sent successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Delete Account OTP Error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'Fail',
      message: "Couldn't send delete account OTP",
      error: error.message,
    });
  }
};

const deleteUserAccount = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.params?.id;
    const { otp } = req.body;

    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ error: 'Invalid user ID' });
    }

    const user = await UserModel.findById(userId).session(session);

    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(httpStatus.NOT_FOUND).send({ error: 'User not found' });
    }

    if (user.deleteAccountOTP !== otp || !user.deleteAccountOTP) {
      await session.abortTransaction();
      session.endSession();
      return res.status(httpStatus.BAD_REQUEST).send({ error: 'Invalid OTP' });
    }

    if (Date.now() > user.deleteAccountExpires) {
      await session.abortTransaction();
      session.endSession();
      return res.status(httpStatus.BAD_REQUEST).send({ error: 'OTP expired' });
    }

    // Proceed with deleting the user account
    const result = await UserModel.deleteOne({ _id: userId }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(httpStatus.OK).json({
      status: 'Success',
      message: 'Account deleted successfully',
      data: result,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Delete Account Error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'Fail',
      message: "Couldn't delete account",
      error: error.message,
    });
  }
};

const changePassword = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // const userId = req.params?.userId;
    const userId = req.user?._id;
    // logger.info(userId, 'userId from token in controller'); 
    const { newPassword, oldPassword } = req.body;
    if (!oldPassword || !newPassword) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: 'Fail',
        message: 'Old password and new password are required',
      });
    }

    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ error: 'Invalid user ID' });
    }

    const user = await UserModel.findById(userId)
      .select('+password')
      .session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(httpStatus.NOT_FOUND).send({ error: 'User not found' });
    }

    // Compare old password with hashed password stored in the database
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({ error: "Password didn't match" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    user.password = hashedNewPassword;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(httpStatus.OK).json({
      status: 'Success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Change Password Error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'Fail',
      message: "Couldn't change password",
      error: error.message,
    });
  }
};

const getUser = catchAsync(async (req, res) => {
  // const userId = req.params?.userId;
  const userId = req.user?._id;

  const result = await authService.getUserService(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get User Successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;
  const result = await authService.updateUserService(userId, data);
  if (result.modifiedCount === !1) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User not found or no changes made',
    );
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Update Successfully',
    data: result,
  });
});

const sendMailWithGoogleController = async (req, res) => {
  try {
    const mailData = { to: 'test@example.com', subject: 'Verify Email' };
    const result = await sendMailWithGoogleWorkspace(mailData);
    res.status(201).send(result);
  } catch (error) {
    logger.error("Google Workspace Email Error:", error);
  }
};

const googleAuthCallback = catchAsync(async (req, res) => {
  const user = req.user;
  const { accessToken, refreshToken } = authService.generateUserTokens(user);

  // Set Refresh Token into cookie
  const cookieOption = {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict',
  };
  res.cookie('refreshToken', refreshToken, cookieOption);

  // Redirect to frontend
  const frontendUrl = config.client_url || 'http://localhost:3001';
  res.redirect(`${frontendUrl}/auth/success?accessToken=${accessToken}`);
});

const githubAuthCallback = catchAsync(async (req, res) => {
  const user = req.user;
  const { accessToken, refreshToken } = authService.generateUserTokens(user);

  // Set Refresh Token into cookie
  const cookieOption = {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict',
  };
  res.cookie('refreshToken', refreshToken, cookieOption);

  // Redirect to frontend
  const frontendUrl = config.client_url || 'http://localhost:3001';
  res.redirect(`${frontendUrl}/auth/success?accessToken=${accessToken}`);
});

const socialLogin = catchAsync(async (req, res) => {
  const result = await authService.socialLoginService(req.body);
  const { refreshToken, ...others } = result;

  const cookieOption = {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict',
  };
  res.cookie('refreshToken', refreshToken, cookieOption);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Social Login Successfully',
    data: others,
  });
});

const ssoAuthCallback = catchAsync(async (req, res) => {
  const user = req.user;
  const { accessToken, refreshToken } = authService.generateUserTokens(user);

  // Set Refresh Token into cookie
  const cookieOption = {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict',
  };
  res.cookie('refreshToken', refreshToken, cookieOption);

  // Redirect to frontend
  const frontendUrl = config.client_url || 'http://localhost:3001';
  res.redirect(`${frontendUrl}/auth/success?accessToken=${accessToken}`);
});

const setupMfa = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await authService.setupMfaService(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MFA Setup Initiated Successfully',
    data: result,
  });
});

const verifyMfa = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { code } = req.body;
  const result = await authService.verifyMfaService(userId, code);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MFA Verified and Enabled Successfully',
    data: result,
  });
});

const validateMfaChallenge = catchAsync(async (req, res) => {
  const { mfaToken, code } = req.body;
  const result = await authService.validateMfaChallengeService(mfaToken, code);

  const { refreshToken, ...others } = result;

  const cookieOption = {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict',
  };
  res.cookie('refreshToken', refreshToken, cookieOption);

  const encryptedPayload = await kmsService.encryptPayload(JSON.stringify(others));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MFA Challenge Successful. Login complete.',
    data: {
      encryptedPayload,
      ...others,
    },
  });
});

const verifyProductAccess = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const result = await authService.verifyProductAccessService(userId, productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product Access Verified successfully',
    data: result,
  });
});

export const authController = {
  register,
  login,
  socialLogin,
  refreshToken,
  confirmEmail,
  getUser,
  updateUser,
  forgetPassword,
  resetPassword,
  deleteUserAccount,
  deleteUserAccountOTP,
  changePassword,
  sendMailWithGoogleController,
  googleAuthCallback,
  githubAuthCallback,
  ssoAuthCallback,
  setupMfa,
  verifyMfa,
  validateMfaChallenge,
  verifyProductAccess,
};

