import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    systemInstruction: { type: String, required: true },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    failures: [
      {
        input: { type: String, required: true },
        expected: { type: String },
        criteria: { type: String },
        feedback: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    successes: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const SkillOptRunSchema = new mongoose.Schema(
  {
    skillName: { type: String, required: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'success', 'failed'],
      default: 'running',
    },
    initialSystemInstruction: { type: String, required: true },
    optimizedSystemInstruction: { type: String },
    epochs: [
      {
        epoch: { type: Number, required: true },
        baseScore: { type: Number, required: true },
        candidateScore: { type: Number },
        appliedEdits: [
          {
            type: {
              type: String,
              enum: ['ADD', 'DELETE', 'REPLACE'],
              required: true,
            },
            targetText: { type: String },
            replacementText: { type: String },
            rationale: { type: String },
          },
        ],
        feedback: { type: String },
        accepted: { type: Boolean, default: false },
      },
    ],
    parameters: {
      maxEpochs: { type: Number, default: 3 },
      batchSize: { type: Number, default: 5 },
      learningRate: { type: Number, default: 0.5 },
    },
    error: { type: String },
  },
  { timestamps: true },
);

// Indexes for high performance querying
SkillSchema.index({ name: 1 });
SkillOptRunSchema.index({ skillName: 1, createdAt: -1 });

export const Skill = mongoose.model('Skill', SkillSchema);
export const SkillOptRun = mongoose.model('SkillOptRun', SkillOptRunSchema);
