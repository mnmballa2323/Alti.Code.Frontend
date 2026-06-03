import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * Machine Learning Engineer
 * Autonomously trains custom PyTorch/TensorFlow micro-models based on raw application data.
 */
const trainMicroModel = async (userId, sessionId, trainingDataSample, targetGoal) => {
    logger.info(`🤖 [ML Engineer] Initializing autonomous PyTorch micro-model training...`);

    try {
        const mlPrompt = `You are an elite Staff Machine Learning Engineer.
Analyze the following training data sample from our application and the target goal.
Generate the complete Python (PyTorch or TensorFlow) training script to build a custom micro-model to solve this goal.
Include data preprocessing, model architecture, training loop, and saving the weights to '.pt' or '.h5'.

Target Goal: ${targetGoal}
Data Sample: ${JSON.stringify(trainingDataSample).substring(0, 5000)}

Return ONLY the raw Python script.`;

        const result = await LlmGatewayService.routeCompletion(
            userId, sessionId, mlPrompt, 'gemini-1.5-pro-002', 'ML-Engineer'
        );

        const pythonScript = result.reply.replace(/```python/g, '').replace(/```/g, '');
        logger.info(`✅ [ML Engineer] PyTorch script generated. Ready for execution on GPU cluster.`);

        return { status: 'training_script_ready', pythonScript };

    } catch (error) {
        logger.error(`❌ [ML Engineer] Model training setup critically failed:`, error);
        throw error;
    }
};

export const MlEngineerService = { trainMicroModel };
