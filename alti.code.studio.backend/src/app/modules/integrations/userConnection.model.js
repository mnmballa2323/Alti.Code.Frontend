/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import mongoose from 'mongoose';

const UserConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      required: true, // e.g., 'mcp_github', 'mcp_slack', 'mcp_notion'
    },
    connectionId: {
      type: String,
      default: null, // Scoped user link ID for self-hosted Nango / custom ID mapping
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'connecting'],
      default: 'disconnected',
    },
    credentials: {
      type: String,
      default: null, // Envelope-encrypted credentials payload (KMS token keys)
    },
  },
  { timestamps: true },
);

// Compound index to ensure uniqueness per user/provider
UserConnectionSchema.index({ userId: 1, provider: 1 }, { unique: true });

const UserConnectionModel = mongoose.model('UserConnection', UserConnectionSchema);

export default UserConnectionModel;
export const UserConnection = UserConnectionModel;
