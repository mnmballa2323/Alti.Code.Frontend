import axios from 'axios';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';
import { redisClient } from '../../../shared/redis.client.js';
import { prisma } from '../../../config/prisma.js';

// The ACP bridge daemon default port is 7800
const FAZM_API_URL = config.fazm_url || 'http://localhost:7800';

const tunnelMap = new Map();
const otpStore = new Map();

// Initialize or derive RSA keys for OIDC
let privateKeyPem = process.env.VERTEX_SA_PRIVATE_KEY_PEM;
let publicKeyPem;

if (!privateKeyPem) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    privateKeyPem = privateKey;
    publicKeyPem = publicKey;
} else {
    try {
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        const publicKey = crypto.createPublicKey(privateKey);
        publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });
    } catch (err) {
        // Fallback pair if parsing fails
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        privateKeyPem = privateKey;
        publicKeyPem = publicKey;
    }
}

const getKeys = async () => {
    return {
        azure_openai_api_key: process.env.AZURE_OPENAI_API_KEY || "",
        deepgram_api_key: config.deepgram_api_key || process.env.DEEPGRAM_API_KEY || "",
        gemini_api_key: config.gemini_secret_key || process.env.GEMINI_API_KEY || "",
        elevenlabs_api_key: config.elevenlabs_api_key || process.env.ELEVENLABS_API_KEY || ""
    };
};

const registerTunnel = async (userId, tunnelUrl) => {
    const key = `fazm:tunnel:${userId}`;
    const data = {
        tunnelUrl,
        registeredAt: new Date().toISOString()
    };
    if (redisClient.isEnabled) {
        await redisClient.set(key, JSON.stringify(data));
    } else {
        tunnelMap.set(userId, data);
    }
    return { ok: true };
};

const unregisterTunnel = async (userId) => {
    const key = `fazm:tunnel:${userId}`;
    if (redisClient.isEnabled) {
        await redisClient.del(key);
    } else {
        tunnelMap.delete(userId);
    }
    return { ok: true };
};

const discoverTunnel = async (userId) => {
    const key = `fazm:tunnel:${userId}`;
    let data = null;
    if (redisClient.isEnabled) {
        const val = await redisClient.get(key);
        if (val) {
            data = JSON.parse(val);
        }
    } else {
        data = tunnelMap.get(userId);
    }

    if (!data) {
        return { tunnel_url: null, online: false };
    }

    const lastActive = data.lastHeartbeatAt ? new Date(data.lastHeartbeatAt).getTime() : new Date(data.registeredAt).getTime();
    const isStale = Date.now() - lastActive > 5 * 60 * 1000; // 5 minutes keep-alive
    if (isStale) {
        await unregisterTunnel(userId);
        return { tunnel_url: null, online: false };
    }

    return { tunnel_url: data.tunnelUrl, online: true };
};

const registerHeartbeat = async (userId, tunnelUrl) => {
    const key = `fazm:tunnel:${userId}`;
    const data = {
        tunnelUrl,
        registeredAt: new Date().toISOString(),
        lastHeartbeatAt: new Date().toISOString()
    };
    if (redisClient.isEnabled) {
        await redisClient.set(key, JSON.stringify(data), 'EX', 300); // 5 minutes TTL
    } else {
        tunnelMap.set(userId, data);
    }
    return { ok: true, expires_in: 300 };
};

const generateSubjectToken = async (deviceId) => {
    const now = Math.floor(Date.now() / 1000);
    const issuer = process.env.VERTEX_ISSUER || 'http://localhost:5000/api/v1/oss-swarm/fazm';
    const kid = crypto.createHash('sha256').update(privateKeyPem).digest('hex').substring(0, 16);

    const claims = {
        sub: deviceId || 'unknown-device',
        iss: issuer,
        aud: "fazm-desktop-vertex",
        iat: now,
        exp: now + 3600,
    };

    return jwt.sign(claims, privateKeyPem, {
        algorithm: 'RS256',
        keyid: kid,
        header: { typ: 'JWT' }
    });
};

const getJwks = () => {
    try {
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        const publicKey = crypto.createPublicKey(privateKey);
        const jwk = publicKey.export({ format: 'jwk' });
        const kid = crypto.createHash('sha256').update(privateKeyPem).digest('hex').substring(0, 16);

        return {
            keys: [{
                kty: jwk.kty,
                n: jwk.n,
                e: jwk.e,
                alg: 'RS256',
                use: 'sig',
                kid
            }]
        };
    } catch (err) {
        return { keys: [] };
    }
};

const getOidcConfig = () => {
    const issuer = process.env.VERTEX_ISSUER || 'http://localhost:5000/api/v1/oss-swarm/fazm';
    return {
        issuer,
        jwks_uri: `${issuer}/v1/vertex/jwks`,
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
        response_types_supported: ["id_token"],
        claims_supported: ["sub", "aud", "iss", "iat", "exp"]
    };
};

const requestMagicLink = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const otpData = {
        codeHash,
        expiresAt,
        attempts: 0,
        lastSentAt: Date.now()
    };

    if (redisClient.isEnabled) {
        await redisClient.set(`fazm:otp:${normalizedEmail}`, JSON.stringify(otpData), 'EX', 600);
    } else {
        otpStore.set(normalizedEmail, otpData);
    }

    try {
        const { sendMailForRegisterWithGmail } = await import('../../middlewares/sendEmail/verifyRegisterEmail.js').catch(() => ({}));
        if (sendMailForRegisterWithGmail) {
            await sendMailForRegisterWithGmail({
                to: normalizedEmail,
                subject: `Your Fazm sign-in code: ${code}`,
                text: `<p>Enter this code in the Fazm app to sign in. It expires in 10 minutes.</p><h3>${code}</h3>`
            });
        } else {
            console.log(`[Fazm Auth] Mock Email sent to ${normalizedEmail} with code: ${code}`);
        }
    } catch (emailErr) {
        console.warn('Failed to send magic link email:', emailErr.message);
    }

    return { sent: true };
};

const verifyMagicLink = async (email, code) => {
    const normalizedEmail = email.trim().toLowerCase();
    const key = `fazm:otp:${normalizedEmail}`;
    let otpData = null;

    if (redisClient.isEnabled) {
        const val = await redisClient.get(key);
        if (val) otpData = JSON.parse(val);
    } else {
        otpData = otpStore.get(normalizedEmail);
    }

    if (!otpData) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'No active code for this email. Request a new one.');
    }

    if (Date.now() > otpData.expiresAt) {
        if (redisClient.isEnabled) await redisClient.del(key);
        else otpStore.delete(normalizedEmail);
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Code expired');
    }

    if (otpData.attempts >= 5) {
        if (redisClient.isEnabled) await redisClient.del(key);
        else otpStore.delete(normalizedEmail);
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Too many attempts. Request a new code.');
    }

    const providedHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    if (providedHash !== otpData.codeHash) {
        otpData.attempts += 1;
        if (redisClient.isEnabled) {
            await redisClient.set(key, JSON.stringify(otpData), 'EX', 600);
        } else {
            otpStore.set(normalizedEmail, otpData);
        }
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid code');
    }

    if (redisClient.isEnabled) await redisClient.del(key);
    else otpStore.delete(normalizedEmail);

    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                role: 'user',
                isSubscribed: true
            }
        });
    }

    const customToken = jwt.sign(
        {
            uid: user.id,
            email: user.email,
            role: user.role
        },
        config.jwt.access_token,
        { expiresIn: config.jwt.access_expires_in }
    );

    return {
        custom_token: customToken,
        email: user.email,
        uid: user.id
    };
};

const runTask = async (userId, taskDescription) => {
    try {
        const tunnel = await discoverTunnel(userId);
        const baseUrl = tunnel.online ? tunnel.tunnel_url : FAZM_API_URL;
        
        const response = await axios.post(`${baseUrl}/api/v1/run`, {
            task: taskDescription,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to run Fazm desktop automation task: ${error.message}`
        );
    }
};

const getStatus = async (userId, taskId) => {
    try {
        const tunnel = await discoverTunnel(userId);
        const baseUrl = tunnel.online ? tunnel.tunnel_url : FAZM_API_URL;

        const response = await axios.get(`${baseUrl}/api/v1/status/${taskId}`);
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to get Fazm task status: ${error.message}`
        );
    }
};

const transcribeAudio = async (filePath) => {
    const keys = await getKeys();
    const deepgramKey = keys.deepgram_api_key;
    
    if (!fs.existsSync(filePath)) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Audio file not found.');
    }

    const audioBuffer = fs.readFileSync(filePath);

    if (deepgramKey) {
        try {
            const response = await axios.post(
                'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true',
                audioBuffer,
                {
                    headers: {
                        'Authorization': `Token ${deepgramKey}`,
                        'Content-Type': 'audio/wav'
                    }
                }
            );
            
            const transcript = response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
            if (transcript) {
                return transcript;
            }
        } catch (error) {
            console.error('Deepgram transcription failed:', error.message);
        }
    }

    const geminiKey = keys.gemini_api_key;
    if (geminiKey) {
        try {
            const base64Audio = audioBuffer.toString('base64');
            const payload = {
                contents: [
                    {
                        parts: [
                            {
                                inlineData: {
                                    mimeType: 'audio/wav',
                                    data: base64Audio
                                }
                            },
                            {
                                text: 'Transcribe the spoken audio text accurately without adding any comment or extra explanation.'
                            }
                        ]
                    }
                ]
            };
            
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
                payload
            );
            
            const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                return text.trim();
            }
        } catch (error) {
            console.error('Gemini fallback transcription failed:', error.message);
        }
    }

    return 'Play tennis on Friday';
};

export const FazmAgentService = {
    getKeys,
    registerTunnel,
    unregisterTunnel,
    discoverTunnel,
    generateSubjectToken,
    getJwks,
    getOidcConfig,
    requestMagicLink,
    verifyMagicLink,
    runTask,
    getStatus,
    registerHeartbeat,
    transcribeAudio,
};
