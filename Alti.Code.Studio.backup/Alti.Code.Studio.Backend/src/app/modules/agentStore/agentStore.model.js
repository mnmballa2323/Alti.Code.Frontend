import mongoose from "mongoose";

const agentListingSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        version: {
            type: String,
            default: "1.0.0",
        },
        author: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            default: 0,
        },
        category: {
            type: String,
            enum: ["Productivity", "Legal", "Research", "Coding", "Utility", "Other"],
            default: "Other",
        },
        capabilities: {
            type: [String],
            default: [],
        },
        rating: {
            type: Number,
            default: 0,
        },
        installCount: {
            type: Number,
            default: 0,
        },
        icon: {
            type: String, // URL to icon
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const AgentListing = mongoose.model("AgentListing", agentListingSchema);

export default AgentListing;
