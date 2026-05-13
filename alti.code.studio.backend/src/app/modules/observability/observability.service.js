import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const PROMETHEUS_URL = config.prometheus_url || 'http://localhost:9090';
const GRAFANA_URL = config.grafana_url || 'http://localhost:3000';

const getContainerCpuUsage = async (containerName) => {
    try {
        // Prometheus PromQL query to get CPU usage for a specific container
        const query = `rate(container_cpu_usage_seconds_total{name="${containerName}"}[1m])`;
        const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
            params: { query },
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch container CPU metrics from Prometheus: ${error.message}`
        );
    }
};

export const ObservabilityService = {
    getContainerCpuUsage,
};
