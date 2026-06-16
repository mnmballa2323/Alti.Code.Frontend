import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authController } from './auth.controller.js';
import { UserRepository } from './prisma.user.repository.js';
import httpStatus from 'http-status';

vi.mock('./prisma.user.repository.js', () => {
    return {
        UserRepository: {
            findByEmail: vi.fn(),
            findById: vi.fn(),
            updateUser: vi.fn(),
            deleteUser: vi.fn(),
        }
    };
});

vi.mock('./auth.utils.js', () => {
    return {
        generateOTP: vi.fn().mockResolvedValue('123456'),
    };
});

vi.mock('../googleCloud/recaptcha.service.js', () => {
    return {
        recaptchaService: {
            createAssessment: vi.fn(),
        }
    };
});

vi.mock('../googleCloud/kms.service.js', () => {
    return {
        kmsService: {
            encryptPayload: vi.fn(),
        }
    };
});

// Helper to run catchAsync wrapped controllers and await their inner async execution
const runController = (controllerFn, req, res) => {
    return new Promise((resolve, reject) => {
        const next = (err) => {
            if (err) reject(err);
            else resolve();
        };
        // Intercept response methods to resolve the promise
        res.status = vi.fn().mockImplementation(() => {
            resolve();
            return res;
        });
        res.json = vi.fn().mockImplementation(() => {
            resolve();
            return res;
        });
        res.send = vi.fn().mockImplementation(() => {
            resolve();
            return res;
        });
        controllerFn(req, res, next);
    });
};

describe('AuthController - Password Reset and Account Deletion Tests', () => {
    let req, res;

    beforeEach(() => {
        vi.clearAllMocks();
        req = {
            body: {},
            params: {},
            user: {}
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
            cookie: vi.fn(),
        };
    });

    it('forgetPassword should generate OTP and update user successfully', async () => {
        req.body = { email: 'test@example.com' };
        UserRepository.findByEmail.mockResolvedValue({ id: 'user-id', email: 'test@example.com' });
        UserRepository.updateUser.mockResolvedValue({});

        await runController(authController.forgetPassword, req, res);

        expect(UserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
        expect(UserRepository.updateUser).toHaveBeenCalledWith('user-id', {
            resetPasswordOTP: '123456',
            resetPasswordExpires: expect.any(Date),
        });
        expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    });

    it('deleteUserAccount should verify OTP and delete user successfully', async () => {
        req.params = { id: 'user-id' };
        req.body = { otp: '123456' };
        UserRepository.findById.mockResolvedValue({
            id: 'user-id',
            deleteAccountOTP: '123456',
            deleteAccountExpires: new Date(Date.now() + 5000)
        });
        UserRepository.deleteUser.mockResolvedValue({ id: 'user-id' });

        await runController(authController.deleteUserAccount, req, res);

        expect(UserRepository.findById).toHaveBeenCalledWith('user-id');
        expect(UserRepository.deleteUser).toHaveBeenCalledWith('user-id');
        expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    });
});
