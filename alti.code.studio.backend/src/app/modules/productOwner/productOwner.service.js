import { productOwnerAgent } from './productOwner.agent.js';
import { logger } from '../../../shared/logger.js';
import { BacklogItem } from './backlog.model.js';
// import { specAgent } from '../agents/spec.agent.js';

/**
 * Service to manage Product Owner operations.
 */
const analyze = async (request) => {
    logger.info(`PO Agent received analysis request: ${request.substring(0, 50)}...`);
    return await productOwnerAgent.analyzeRequest(request);
};

const createStories = async (featureName, description) => {
    logger.info(`PO Agent generating stories for: ${featureName}`);
    return await productOwnerAgent.generateUserStories(featureName, description);
};

const addToBacklog = async (itemData) => {
    try {
        const newItem = await BacklogItem.create(itemData);
        logger.info(`PO Agent added item to backlog: ${newItem.title}`);
        return newItem;
    } catch (error) {
        logger.error('Failed to add item to backlog', error);
        throw error;
    }
};

const commissionSpec = async (backlogItemId) => {
    try {
        const item = await BacklogItem.findById(backlogItemId);
        if (!item) throw new Error('Backlog item not found');

        logger.info(`PO Agent commissioning spec for: ${item.title}`);
        // const specContent = await specAgent.draft(item.description);
        const specContent = "Mocked Spec Content - Agent Missing";

        item.specPath = 'generated/specification.md'; // simplified for now
        item.status = 'Spec_Drafted';
        await item.save();

        return { item, specContent };
    } catch (error) {
        logger.error('Failed to commission spec', error);
        throw error;
    }
};

export const productOwnerService = {
    analyze,
    createStories,
    addToBacklog,
    commissionSpec
};
