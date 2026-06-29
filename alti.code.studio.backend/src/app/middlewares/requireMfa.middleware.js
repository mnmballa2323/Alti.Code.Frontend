import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError.js';
import { UserRepository } from '../modules/auth/prisma.user.repository.js';

export const requireMfa = async (req, res, next) => {
  try {
    if (req.user && req.user._id) {
      const user = await UserRepository.findById(req.user._id);
      if (user && user.mfaEnabled && !req.user.mfaVerified) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'MFA Verification strictly required for this route.',
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
