/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    actor: {
        type: String,
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        index: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // Allow arbitrary JSON objects
        default: {}
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE', 'DENIED', 'WARNING'],
        default: 'SUCCESS'
    },
    environment: {
        type: String,
        default: 'development'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    // CRYPTOGRAPHIC PROOF
    hash: {
        type: String,
        required: true,
        index: true
    },
    previousHash: {
        type: String,
        required: true
    },
    // GCP KMS Cryptographic Proof (Non-Repudiation)
    kmsSignature: {
        type: String,
        required: false // Optional for legacy records
    },
    kmsKeyId: {
        type: String,
        required: false
    },
    // AI Decision Provenance (Explainable AI)
    aiProvenance: {
        type: new mongoose.Schema({
            promptId: String,
            responseId: String,
            modelName: String,
            temperature: Number,
            systemInstruction: String,
            reasoningTokenCount: Number
        }, { _id: false }),
        required: false
    }
}, {
    timestamps: true // Adds createdAt (which doubles as timestamp) and updatedAt
});

// TTL Index: Auto-delete logs after 7 years for IRS and Enterprise Compliance (SOX)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 2555 });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
