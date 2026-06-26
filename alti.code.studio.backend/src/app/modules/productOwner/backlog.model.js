import mongoose from 'mongoose';

const backlogItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: [
        'Backlog',
        'Analysis',
        'Spec_Drafted',
        'Planned',
        'In_Progress',
        'Done',
      ],
      default: 'Backlog',
    },
    userStories: [
      {
        title: String,
        acceptance_criteria: [String],
        estimation_points: Number,
      },
    ],
    aiAnalysis: {
      alignment_score: Number,
      alignment_reasoning: String,
      suggested_features: Array,
    },
    specPath: {
      type: String, // Path to the commissioned spec file
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const BacklogItem = mongoose.model('BacklogItem', backlogItemSchema);
