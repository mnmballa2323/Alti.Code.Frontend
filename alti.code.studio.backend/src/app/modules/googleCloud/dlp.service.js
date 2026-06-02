import dlp from '@google-cloud/dlp';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

const dlpClient = new dlp.DlpServiceClient();

/**
 * Inspect text for sensitive info types (PII, secrets, etc.) using Google Cloud DLP
 * @param {string} text - The content to inspect
 * @returns {Promise<Array>} - List of findings
 */
const inspectText = async (text) => {
    try {
        const project = config.gcp.project_id;
        const request = {
            parent: `projects/${project}/locations/global`,
            item: { value: text },
            inspectConfig: {
                // Common info types supported by GCP DLP
                infoTypes: [
                    { name: 'EMAIL_ADDRESS' },
                    { name: 'PERSON_NAME' },
                    { name: 'PHONE_NUMBER' },
                    { name: 'US_SOCIAL_SECURITY_NUMBER' },
                    { name: 'CREDIT_CARD_NUMBER' },
                    { name: 'AUTH_TOKEN' },
                    { name: 'AWS_CREDENTIALS' },
                    { name: 'AZURE_AUTH_TOKEN' },
                    { name: 'BASIC_AUTH_HEADER' },
                    { name: 'ENCRYPTION_KEY' },
                    { name: 'GCP_API_KEY' },
                    { name: 'GCP_CREDENTIALS' },
                    { name: 'JSON_WEB_TOKEN' },
                ],
                includeQuote: true,
            },
        };

        const [response] = await dlpClient.inspectContent(request);
        return response.result.findings;
    } catch (error) {
        logger.error('Google Cloud DLP Error:', error);
        // Fallback or skip if DLP is not configured to prevent platform blocking
        return [];
    }
};

/**
 * Redact sensitive information from text
 * @param {string} text 
 * @returns {Promise<string>}
 */
const redactText = async (text) => {
    try {
        const project = config.gcp.project_id;
        const request = {
            parent: `projects/${project}/locations/global`,
            item: { value: text },
            deidentifyConfig: {
                infoTypeTransformations: {
                    transformations: [
                        {
                            primitiveTransformation: {
                                characterMaskConfig: {
                                    maskingCharacter: '*',
                                    numberToMask: 0,
                                    reverseOrder: false,
                                },
                            },
                        },
                    ],
                },
            },
            inspectConfig: {
                infoTypes: [
                    { name: 'EMAIL_ADDRESS' },
                    { name: 'PERSON_NAME' },
                    { name: 'PHONE_NUMBER' },
                    { name: 'US_SOCIAL_SECURITY_NUMBER' },
                    { name: 'CREDIT_CARD_NUMBER' },
                    { name: 'AUTH_TOKEN' },
                    { name: 'AWS_CREDENTIALS' },
                    { name: 'AZURE_AUTH_TOKEN' },
                    { name: 'BASIC_AUTH_HEADER' },
                    { name: 'ENCRYPTION_KEY' },
                    { name: 'GCP_API_KEY' },
                    { name: 'GCP_CREDENTIALS' },
                    { name: 'JSON_WEB_TOKEN' },
                ],
            },
        };

        const [response] = await dlpClient.deidentifyContent(request);
        return response.item.value;
    } catch (error) {
        logger.error('Google Cloud DLP Redaction Error:', error);
        return text;
    }
};

export const GoogleDlpService = {
    inspectText,
    redactText
};
