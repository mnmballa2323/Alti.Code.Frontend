/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Detective" - Security Audit & Forensics Agent
 * Responsible for deep SAST, log analysis, and dependency vulnerability checks.
 */
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

const execAsync = util.promisify(exec);

class DetectiveAgent {
  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Perform Static Application Security Testing (SAST) on a file
   * @param {string} filePath
   */
  async auditCodebase(filePath) {
    logger.info(`🕵️ Detective: Auditing ${filePath} for vulnerabilities...`);

    let content;
    try {
      content = await fs.readFile(
        path.resolve(this.projectRoot, filePath),
        'utf-8',
      );
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }

    const prompt = `
        You are "The Detective", a Senior Security Researcher.
        TASK: Analyze this code for security vulnerabilities.
        Focus on: SQL Injection, XSS, RCE, Insecure Deserialization, Hardcoded Secrets.
        
        CODE:
        ${content}

        OUTPUT JSON:
        {
            "score": number (0-100, 100 is secure),
            "vulnerabilities": [
                { "type": "SQLi", "severity": "High", "line": 10, "description": "..." }
            ]
        }
        `;

    const response = await aiProvider.reason(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { score: 0, vulnerabilities: [] };

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Analyze log files for intrusion patterns
   * @param {string} logContent
   */
  async analyzeLogs(logContent) {
    logger.info(`🕵️ Detective: Analyzing logs...`);

    const prompt = `
        You are "The Detective".
        TASK: Analyze these logs for suspicious activity (brute force, port scanning, unauthorized access).
        
        LOGS:
        ${logContent.substring(0, 5000)}

        OUTPUT JSON:
        {
            "suspicious": boolean,
            "threats": [
                { "type": "Brute Force", "timestamp": "...", "details": "..." }
            ]
        }
        `;

    const response = await aiProvider.reason(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    return jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { suspicious: false, threats: [] };
  }

  /**
   * Check dependencies for known vulnerabilities
   */
  async checkDependencies() {
    logger.info(`🕵️ Detective: running npm audit...`);
    try {
      const { stdout } = await execAsync('npm audit --json', {
        cwd: this.projectRoot,
      });
      const auditResult = JSON.parse(stdout);

      // AI Analysis of the audit
      const prompt = `
            You are "The Detective".
            TASK: Summarize this npm audit report. Prioritize Critical/High issues.
            
            REPORT:
            ${JSON.stringify(auditResult.metadata)}
            ${JSON.stringify(auditResult.advisories || auditResult.vulnerabilities).substring(0, 2000)}

            OUTPUT string: Brief summary of security posture.
            `;

      const summary = await aiProvider.generate(prompt);
      return { raw: auditResult.metadata, summary };
    } catch (error) {
      // npm audit returns non-zero exit code if vulnerabilities found
      if (error.stdout) {
        const auditResult = JSON.parse(error.stdout);
        return {
          raw: auditResult.metadata,
          summary: 'Vulnerabilities found. Please review npm audit report.',
        };
      }
      throw error;
    }
  }
}

export const detectiveAgent = new DetectiveAgent();
