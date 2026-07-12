import { loopEngineeringService } from './loopEngineering.service.js';

const audit = async (req, res) => {
  try {
    const { projectPath } = req.body;
    const result = await loopEngineeringService.audit(projectPath);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const init = async (req, res) => {
  try {
    const { projectPath, pattern, tool, dryRun } = req.body;
    if (!pattern || !tool) {
      return res.status(400).json({ error: 'pattern and tool are required parameters' });
    }
    const result = await loopEngineeringService.init(projectPath, pattern, tool, dryRun);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCost = async (req, res) => {
  try {
    const { pattern, level, cadence } = req.body;
    if (!pattern || !level) {
      return res.status(400).json({ error: 'pattern and level are required parameters' });
    }
    const result = await loopEngineeringService.getCostEstimates(pattern, level, cadence);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listPatterns = async (req, res) => {
  try {
    const result = await loopEngineeringService.listPatterns();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sync = async (req, res) => {
  try {
    const { projectPath, autoFix, dryRun } = req.body;
    const result = await loopEngineeringService.sync(projectPath, autoFix, dryRun);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const context = async (req, res) => {
  try {
    const { ledger, operation, options } = req.body;
    const result = await loopEngineeringService.context(ledger, operation, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const worktree = async (req, res) => {
  try {
    const { action, runId, pattern, extraArgs } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'action parameter is required' });
    }
    const result = await loopEngineeringService.worktree(action, runId, pattern, extraArgs);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const LoopEngineeringController = {
  audit,
  init,
  getCost,
  listPatterns,
  sync,
  context,
  worktree,
};

