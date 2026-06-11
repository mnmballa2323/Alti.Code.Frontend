import { ErrorReporting } from '@google-cloud/error-reporting';
import config from '../../../../config/index.js';

/**
 * Google Cloud Error Reporting (Apache 2.0 SDK) Service.
 * Autonomously intercepts critical Swarm exceptions and aggregates them natively
 * in the GCP Error Reporting dashboard for real-time SRE alerting.
 */
class GoogleErrorReportingService {
    constructor() {
        this.projectId = config.gcp_project_id || process.env.GOOGLE_CLOUD_PROJECT || 'alti-code-studio';

        if (config.private_cloud_mode) {
            console.log('🛡️ [ErrorReporting] Private cloud mode active. GCP ErrorReporting disabled.');
            this.errors = null;
            return;
        }

        try {
            // Initialize Google Cloud Error Reporting
            this.errors = new ErrorReporting({
                projectId: this.projectId,
                reportMode: 'always', // Force reporting even in local dev for testing
                logLevel: 2 // Log errors
            });
        } catch (error) {
            console.warn('⚠️ [ErrorReporting] Could not initialize ErrorReporting client.');
        }
    }

    /**
     * Reports an exception to Google Cloud.
     * @param {Error|string} err - The error object or message
     */
    reportException(err) {
        if (!this.errors) return;

        try {
            let errorToReport = err;
            if (!(err instanceof Error)) {
                errorToReport = new Error(err);
            }

            // Create a custom ErrorEvent for high-fidelity stack tracing
            const event = this.errors.event();
            event.setMessage(errorToReport.stack || errorToReport.message);
            event.setUser(process.env.USER || 'Alti-Swarm-Node');

            // Fire and forget
            this.errors.report(event, () => {
                // Silently succeed
            });
        } catch (reportError) {
            console.error('❌ [ErrorReporting] Failed to report error to GCP:', reportError.message);
        }
    }
}

export const errorReportingService = new GoogleErrorReportingService();
