
import { engineAgent } from './engine.agent.js';
import { catchAsync } from '../../../shared/catchAsync.js';

const healthCheck = catchAsync(async (req, res) => {
    const result = await engineAgent.checkHealth();
    res.status(200).json(result);
});

const ingestFile = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const result = await engineAgent.ingestFile(req.file.path);
    res.status(200).json(result);
});

const analyzeGraph = catchAsync(async (req, res) => {
    const result = await engineAgent.analyzeGraph(req.body.matrix);
    res.status(200).json(result);
});

const indexDocs = catchAsync(async (req, res) => {
    const result = await engineAgent.indexDocuments(req.body.documents);
    res.status(200).json(result);
});

const askOracle = catchAsync(async (req, res) => {
    const result = await engineAgent.ask(req.body.query);
    res.status(200).json(result);
});

export const engineController = {
    healthCheck,
    ingestFile,
    analyzeGraph,
    indexDocs,
    askOracle
};
