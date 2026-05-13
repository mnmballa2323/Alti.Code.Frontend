import * as ArchitectureService from './architecture.service.js';

export const ingestGit = async (req, res, next) => {
  try {
    const { repoUrl, token } = req.body;
    const result = await ArchitectureService.startIngestionJob(repoUrl, token);
    res.status(200).json({
      success: true,
      message: 'Ingestion started successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ingestUpload = async (req, res, next) => {
  try {
    // Handling file upload logic would go here
    const result = await ArchitectureService.processUploadedFiles(req.files);
    res.status(200).json({
      success: true,
      message: 'Upload ingestion started successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ArchitectureService.getJobStatus(id);
    res.status(200).json({
      success: true,
      message: 'Job status retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getGraph = async (req, res, next) => {
  try {
    const { repoId } = req.query;
    const result = await ArchitectureService.getGraph(repoId);
    res.status(200).json({
      success: true,
      message: 'Graph retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNodeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ArchitectureService.getNodeDetails(id);
    res.status(200).json({
      success: true,
      message: 'Node details retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getClusterDetails = async (req, res, next) => {
  try {
    const { layer } = req.params;
    const result = await ArchitectureService.getClusterDetails(layer);
    res.status(200).json({
      success: true,
      message: 'Cluster details retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const askQuestion = async (req, res, next) => {
  try {
    const { query, repoId } = req.body;
    const result = await ArchitectureService.askQuestion(query, repoId);
    res.status(200).json({
      success: true,
      message: 'Question answered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
