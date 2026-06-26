import mongoose from 'mongoose';

const WorkflowSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    triggerType: {
      type: String,
      enum: ['schedule', 'webhook'],
      required: true,
    },
    frequency: { type: String }, // raw cron string, required if triggerType is 'schedule'
    webhookEvent: { type: String }, // required if triggerType is 'webhook'
    prompt: { type: String, required: true },
    tools: [{ type: String }], // Array of connection app IDs
    status: {
      type: String,
      enum: ['active', 'paused', 'failed'],
      default: 'active',
    },
    schedulerJobName: { type: String }, // Google Cloud Scheduler Job Name to manage it
  },
  { timestamps: true },
);

const WorkflowRunSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    status: {
      type: String,
      enum: ['running', 'success', 'failed'],
      default: 'running',
    },
    logs: [
      {
        action: { type: String, required: true },
        tool: { type: String, required: true },
        payload: { type: mongoose.Schema.Types.Mixed }, // Arbitrary JSON
        timestamp: { type: Date, default: Date.now },
      },
    ],
    error: { type: String },
  },
  { timestamps: true },
);

// Indexes for fast querying
WorkflowSchema.index({ userId: 1 });
WorkflowRunSchema.index({ workflowId: 1, createdAt: -1 });

export const Workflow = mongoose.model('Workflow', WorkflowSchema);
export const WorkflowRun = mongoose.model('WorkflowRun', WorkflowRunSchema);
