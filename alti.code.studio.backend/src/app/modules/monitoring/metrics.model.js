/**
 * Copyright (c) 2024 Inso Code
 *
 * Enterprise Cost & Compute Metric Schema
 * Tracks every single prompt and response token utilized by the AI Swarm.
 * Essential for S&P500 companies tracking Vertex AI / Gemini operational limits across tenants.
 */

import mongoose from 'mongoose';

const LLMMetricsSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_enterprise_tenant',
      index: true,
    },
    agentName: {
      type: String,
      required: true,
      index: true,
    },
    model: {
      type: String,
      required: true,
      default: 'gemini-3.1-pro',
    },
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    estimatedCostUsd: {
      type: Number,
      default: 0,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for fast tenant-specific aggregation by month
LLMMetricsSchema.index({ tenantId: 1, timestamp: -1 });

export const LLMMetrics = mongoose.model('LLMMetrics', LLMMetricsSchema);
