import mongoose from 'mongoose';

const architectureNodeSchema = new mongoose.Schema(
  {
    repoId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['file', 'function', 'class', 'service', 'module'],
      required: true,
    },
    name: { type: String, required: true },
    path: { type: String, required: true },
    layer: {
      type: String,
      enum: [
        'frontend',
        'backend',
        'api',
        'database',
        'infrastructure',
        'unknown',
      ],
      default: 'unknown',
    },
    metadata: {
      language: { type: String },
      loc: { type: Number },
      exports: [{ type: String }],
      imports: [{ type: String }],
    },
    aiEnrichment: {
      summary: { type: String },
      purpose: { type: String },
      role: { type: String },
    },
  },
  { timestamps: true },
);

const architectureEdgeSchema = new mongoose.Schema(
  {
    repoId: { type: String, required: true, index: true },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArchitectureNode',
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArchitectureNode',
      required: true,
    },
    relationship_type: {
      type: String,
      enum: ['imports', 'calls', 'depends_on', 'implements'],
      required: true,
    },
    weight: { type: Number, default: 1 },
  },
  { timestamps: true },
);

export const ArchitectureNode =
  mongoose.models.ArchitectureNode ||
  mongoose.model('ArchitectureNode', architectureNodeSchema);
export const ArchitectureEdge =
  mongoose.models.ArchitectureEdge ||
  mongoose.model('ArchitectureEdge', architectureEdgeSchema);
