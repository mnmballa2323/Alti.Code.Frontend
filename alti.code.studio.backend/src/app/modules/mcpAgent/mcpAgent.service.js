import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const MCP_SERVER_URL = config.mcp_url || 'http://localhost:3020';

const executeMcpTool = async (serverName, toolName, args) => {
  try {
    // Standard structured request to an MCP Host
    const response = await axios.post(`${MCP_SERVER_URL}/api/v1/execute`, {
      server: serverName,
      tool: toolName,
      arguments: args,
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to execute tool via Model Context Protocol: ${error.message}`,
    );
  }
};

const getMcpResources = async serverName => {
  try {
    const response = await axios.get(
      `${MCP_SERVER_URL}/api/v1/resources/${serverName}`,
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch resources from MCP server: ${error.message}`,
    );
  }
};

export const McpAgentService = {
  executeMcpTool,
  getMcpResources,
};
