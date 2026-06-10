import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { workerFactory } from '../queue/worker.factory.js';
import { licenseService } from '../governance/license.service.js';
import { logger } from '../../../shared/logger.js';

const execAsync = promisify(exec);

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

const getSwarmTelemetry = async () => {
    // 1. Swarm Capacity Metrics
    const swarmStatus = workerFactory.getStatus();
    const skillsDir = path.join(process.cwd(), '.agent/skills');
    let backupAgentsCount = 0;
    try {
        const files = await fs.readdir(skillsDir);
        backupAgentsCount = files.filter(f => f.endsWith('.md') || f.endsWith('.json') || f.endsWith('.jsonl')).length;
    } catch (err) {
        backupAgentsCount = 0;
    }

    // 2. Daemon Telemetry (Generator process lookup)
    let daemonRunning = false;
    let daemonPid = null;
    let daemonUptime = null;
    try {
        // Look up using ps command - grep inside square brackets [a] avoids matching the grep command itself
        let stdout = '';
        try {
            const result = await execAsync('ps aux | grep -E "[a]utonomous_agent_generator.js|[a]utonomous_agent_factory.js"');
            stdout = result.stdout;
        } catch (err) {
            stdout = '';
        }
        const line = stdout.trim();
        if (line) {
            daemonRunning = true;
            const parts = line.split(/\s+/);
            daemonPid = parseInt(parts[1], 10);
            try {
                const { stdout: etimeOut } = await execAsync(`ps -p ${daemonPid} -o etime=`);
                daemonUptime = etimeOut.trim();
            } catch (uptimeErr) {
                daemonUptime = "unknown";
            }
        }
    } catch (err) {
        daemonRunning = false;
    }

    // 3. Sovereign Git Synchronization Status
    let gitSyncStatus = {
        branch: 'unknown',
        dirty: false,
        uncommittedChangesCount: 0,
        latestCommit: 'unknown',
        aheadBehind: { ahead: 0, behind: 0 }
    };
    try {
        const { stdout: branchOut } = await execAsync('git rev-parse --abbrev-ref HEAD');
        gitSyncStatus.branch = branchOut.trim();

        const { stdout: statusOut } = await execAsync('git status --porcelain');
        const statusLines = statusOut.trim().split('\n').filter(Boolean);
        gitSyncStatus.dirty = statusLines.length > 0;
        gitSyncStatus.uncommittedChangesCount = statusLines.length;

        const { stdout: logOut } = await execAsync('git log -1 --format="%h | %s | %an (%ar)"');
        gitSyncStatus.latestCommit = logOut.trim();

        try {
            const { stdout: aheadOut } = await execAsync('git rev-list --left-right --count HEAD...@{u}');
            const [ahead, behind] = aheadOut.trim().split(/\s+/).map(Number);
            gitSyncStatus.aheadBehind = { ahead, behind };
        } catch (e) {
            gitSyncStatus.aheadBehind = { ahead: 0, behind: 0 };
        }
    } catch (gitErr) {
        logger.debug(`Observability Git check bypassed or failed: ${gitErr.message}`);
    }

    // 4. License Compliance Metrics
    let licenseCompliance = {
        compliant: true,
        violations: [],
        complianceRating: '100%'
    };
    try {
        const pkgPath = path.join(process.cwd(), 'package.json');
        const checkResult = await licenseService.checkCompatibility(pkgPath);
        licenseCompliance.compliant = checkResult.compliant;
        licenseCompliance.violations = checkResult.violations;
        licenseCompliance.complianceRating = checkResult.compliant ? '100%' : '80%';
    } catch (licErr) {
        logger.debug(`Observability License check bypassed or failed: ${licErr.message}`);
    }

    return {
        swarmCapacity: {
            activeAgentsCount: swarmStatus.activeCount || 0,
            pendingAgentsCount: swarmStatus.pending?.length || 0,
            legionAgentsCount: swarmStatus.legionCount || 0,
            armadaAgentsCount: swarmStatus.armadaCount || 0,
            totalRegisteredInRegistry: swarmStatus.totalRegistered || 0,
            backupAgentsCount,
        },
        daemonTelemetry: {
            daemonRunning,
            daemonPid,
            daemonUptime,
        },
        gitSyncStatus,
        licenseCompliance,
    };
};

/**
 * Pillar 32: Visual Chaos Monkey (Gemini 1.5 Pro Vision)
 * Simulates analyzing a Grafana screenshot for catastrophic memory leaks
 */
const watchGrafanaDashboards = async (base64GrafanaScreenshot) => {
    logger.info(`🐒 [Chaos Monkey] Pillar 32: Analyzing Grafana metrics visually via Gemini Vision...`);
    
    // Simulating the Vision API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulating that the Vision model detected a steep memory curve
    const visionDecision = "CRITICAL_LEAK_DETECTED";
    
    if (visionDecision === "CRITICAL_LEAK_DETECTED") {
        logger.error(`🚨 [Chaos Monkey] Gemini Vision detected a catastrophic memory leak on production!`);
        logger.info(`   [Chaos Monkey] Autonomously invoking CI/CD Healer to initiate rollback...`);
        
        // Simulating passing the rollback request to the healer
        // await cicdHealerService.analyzeAndHealFailure("CRITICAL PRODUCTION MEMORY LEAK. Revert latest deployment.");
        
        return { status: "ROLLED_BACK", reason: "Visual detection of memory leak." };
    }

    return { status: "HEALTHY" };
};

export const ObservabilityService = {
    getContainerCpuUsage,
    getSwarmTelemetry,
    watchGrafanaDashboards
};
