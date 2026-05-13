/**
 * Copyright (c) 2024 Alti.Code.Studio
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
        type: String, // Stringified JSON to allow flexibility without schema rigidness
        default: '{}'
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
    }
}, {
    timestamps: true // Adds createdAt (which doubles as timestamp) and updatedAt
});

// TTL Index: Auto-delete logs after 90 days to manage storage (Compliance standard)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
