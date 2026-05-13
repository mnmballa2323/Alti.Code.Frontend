import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const QDRANT_API_URL = config.qdrant_url || 'http://localhost:6333';

const createCollection = async (collectionName, vectorSize = 1536, distanceMetric = 'Cosine') => {
    try {
        const response = await axios.put(`${QDRANT_API_URL}/collections/${collectionName}`, {
            vectors: {
                size: vectorSize,
                distance: distanceMetric,
            },
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to create Qdrant collection: ${error.message}`
        );
    }
};

const upsertPoints = async (collectionName, points) => {
    try {
        const response = await axios.put(`${QDRANT_API_URL}/collections/${collectionName}/points`, {
            points: points,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to upsert points to Qdrant: ${error.message}`
        );
    }
};

const searchVectors = async (collectionName, vectorQuery, limit = 5, filter = null) => {
    try {
        const payload = {
            vector: vectorQuery,
            limit: limit,
            with_payload: true,
        };
        if (filter) {
            payload.filter = filter;
        }
        const response = await axios.post(`${QDRANT_API_URL}/collections/${collectionName}/points/search`, payload);
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to search Qdrant vector database: ${error.message}`
        );
    }
};

export const QdrantService = {
    createCollection,
    upsertPoints,
    searchVectors,
};
