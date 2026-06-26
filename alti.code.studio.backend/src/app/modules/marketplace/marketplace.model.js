/**
 * @fileoverview MarketplacePlugin — Mongoose Model (v3.1.0)
 *
 * Tracks installed marketplace agents in MongoDB. Falls back gracefully to the
 * file-based `registry.json` if Mongo is unavailable.
 */
import mongoose from 'mongoose';

const MarketplacePluginSchema = new mongoose.Schema(
  {
    agentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^[a-z][a-z0-9._-]+$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      // Loose semver check — e.g. "1.0.0", "2.1.3-beta.1"
      match: /^\d+\.\d+\.\d+(-[\w.]+)?$/,
    },
    author: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'data',
        'systems',
        'security',
        'mobile',
        'infrastructure',
        'backend',
        'frontend',
        'other',
      ],
      default: 'other',
    },
    description: {
      type: String,
      default: '',
    },
    pluginPath: {
      type: String,
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    installedBy: {
      type: String,
      default: 'system',
    },
    yamlPath: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // adds createdAt (install time) and updatedAt
  },
);

// Compound index for fast search by category + enabled status
MarketplacePluginSchema.index({ category: 1, enabled: 1 });

// Full-text search index on name + description
MarketplacePluginSchema.index({ name: 'text', description: 'text' });

export const MarketplacePlugin = mongoose.model(
  'MarketplacePlugin',
  MarketplacePluginSchema,
);
