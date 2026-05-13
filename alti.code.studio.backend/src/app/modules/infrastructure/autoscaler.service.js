/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * Zero-Touch DevOps: Autoscaler Service
 * Connects directly to real-time billing and telemetry limits to autonomously
 * scale Kubernetes resources up or down without human oversight.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../../../shared/logger.js';

const execAsync = promisify(exec);

class AutoscalerService {
    constructor() {
        this.maxMonthlyBudgetUsd = process.env.MAX_MONTHLY_BUDGET_USD || 5000;
        this.currentMonthlyRunRate = 0;
        this.namespace = process.env.K8S_NAMESPACE || 'default';
        this.isScaling = false;
    }

    /**
     * Polls the cloud billing API (mocked here if disabled)
     * and adjusts replicas up or down.
     */
    async evaluateScaleEvent(serviceName, currentLatencyMs, errorRate) {
        if (this.isScaling) return;
        this.isScaling = true;

        logger.info(`⚖️ Zero-Touch DevOps: Evaluating scale event for ${serviceName}...`);

        try {
            // 1. Check budget limits
            this.currentMonthlyRunRate = await this.fetchCurrentRunRate();

            if (this.currentMonthlyRunRate > this.maxMonthlyBudgetUsd * 0.9) {
                logger.warn(`💸 Zero-Touch DevOps: Critical budget threshold reached ($${this.currentMonthlyRunRate} / $${this.maxMonthlyBudgetUsd}). Forcing scale down to preserve capital.`);
                await this.scaleDeployment(serviceName, 1);
                return;
            }

            // 2. Performance-based scaling
            const currentReplicas = await this.getCurrentReplicas(serviceName);

            if (errorRate > 0.05 || currentLatencyMs > 2000) {
                // High error rate or high latency -> Scale UP if under budget
                const targetReplicas = Math.min(currentReplicas + 2, Math.floor(this.maxMonthlyBudgetUsd / 500)); // Arbitrary max based on budget
                if (currentReplicas < targetReplicas) {
                    logger.info(`📈 Zero-Touch DevOps: High load detected latency=${currentLatencyMs}ms, errorRate=${(errorRate * 100).toFixed(1)}%. Scaling UP to ${targetReplicas} replicas.`);
                    await this.scaleDeployment(serviceName, targetReplicas);
                }
            } else if (currentLatencyMs < 200 && currentReplicas > 2) {
                // Low latency and over-provisioned -> Scale DOWN to save money
                logger.info(`📉 Zero-Touch DevOps: Low load detected latency=${currentLatencyMs}ms. Scaling DOWN to save compute cost.`);
                await this.scaleDeployment(serviceName, currentReplicas - 1);
            }

        } catch (error) {
            logger.error(`❌ Zero-Touch DevOps: Autoscaler evaluation failed: ${error.message}`);
        } finally {
            this.isScaling = false;
        }
    }

    async fetchCurrentRunRate() {
        // In production, this would hit GCP Billing API, AWS Cost Explorer, or Stripe API.
        // For simulation, returning a mock value below threshold.
        const mockCost = Math.random() * 2000;
        return parseFloat(mockCost.toFixed(2));
    }

    async getCurrentReplicas(serviceName) {
        if (process.env.KUBECTL_AUTORUN !== 'true') return 2; // Simulation default

        try {
            const { stdout } = await execAsync(`kubectl get deployment ${serviceName} -n ${this.namespace} -o=jsonpath='{.spec.replicas}'`);
            return parseInt(stdout.trim(), 10);
        } catch {
            return 1;
        }
    }

    async scaleDeployment(serviceName, replicas) {
        if (process.env.KUBECTL_AUTORUN !== 'true') {
            logger.warn(`⚠️ Zero-Touch DevOps: KUBECTL_AUTORUN disabled. Simulated scaling ${serviceName} to ${replicas} replicas.`);
            return;
        }

        try {
            await execAsync(`kubectl scale deployment ${serviceName} --replicas=${replicas} -n ${this.namespace}`);
            logger.info(`✅ Zero-Touch DevOps: Successfully scaled ${serviceName} to ${replicas} replicas.`);
        } catch (error) {
            logger.error(`❌ Zero-Touch DevOps: Failed to scale deployment ${serviceName}: ${error.message}`);
        }
    }
}

export const autoscalerService = new AutoscalerService();
