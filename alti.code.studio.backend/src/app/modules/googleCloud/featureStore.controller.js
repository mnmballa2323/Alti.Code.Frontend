import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { featureStoreService } from './feature_store.service.js';

const getFeature = catchAsync(async (req, res) => {
    const { entityId } = req.params;
    
    if (!entityId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'entityId is required.' });
    }

    const featureValues = await featureStoreService.getPrecomputedEmbedding(entityId);

    if (!featureValues) {
        return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Feature not found in store.' });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Vertex AI Feature Store context retrieved.',
        data: { featureValues },
    });
});

export const FeatureStoreController = {
    getFeature
};
