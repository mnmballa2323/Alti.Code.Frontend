/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Captain" - System Health & Operations Agent
 * Monitors system vitals and declares emergencies if thresholds are breached.
 */
import { logger } from '../../../shared/logger.js';
import os from 'os';

class CaptainAgent {
  constructor() {
    this.status = 'nominal'; // nominal, warning, critical, emergency
    this.lastCheck = null;
  }

  /**
   * Monitor system health metrics
   */
  async monitorHealth() {
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;
    const loadAvg = os.loadavg()[0]; // 1 minute load average

    logger.info(
      `⚓ Captain: System Health Check - MEM: ${memUsage.toFixed(1)}% | LOAD: ${loadAvg.toFixed(2)}`,
    );

    // Simple threshold logic
    if (memUsage > 90 || loadAvg > 5) {
      return this.declareEmergency(
        'critical',
        `High resource usage: MEM ${memUsage.toFixed(1)}%, LOAD ${loadAvg.toFixed(2)}`,
      );
    } else if (memUsage > 70 || loadAvg > 2) {
      this.status = 'warning';
      logger.warn('⚓ Captain: Warning - Elevated resource usage.');
    } else {
      this.status = 'nominal';
    }

    this.lastCheck = new Date();
    return {
      status: this.status,
      metrics: {
        memoryUsage: `${memUsage.toFixed(1)}%`,
        loadAverage: loadAvg,
        uptime: os.uptime(),
      },
    };
  }

  /**
   * Declare start of an emergency protocol
   * @param {string} level
   * @param {string} reason
   */
  declareEmergency(level, reason) {
    logger.error(
      `⚓ Captain: 🚨 DECLARING ${level.toUpperCase()} EMERGENCY: ${reason}`,
    );
    this.status = level;

    // In a real system, this would trigger pagers, scale up auto-scaling groups,
    // or switch to read-only mode.
    return {
      status: level,
      action: 'Protocol Omega initiated (Mock)',
      reason,
    };
  }

  /**
   * Get current system status
   */
  getStatus() {
    return {
      status: this.status,
      lastCheck: this.lastCheck,
    };
  }
}

export const captainAgent = new CaptainAgent();
