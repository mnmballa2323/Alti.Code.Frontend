import { $ } from 'zx';
import fs from 'fs/promises';
import path from 'path';

export const DeepsecService = {
  async scanCodebase(targetPath = process.cwd()) {
    try {
      const deepsecDir = path.join(targetPath, '.deepsec');
      const hasDeepsec = await fs.access(deepsecDir).then(() => true).catch(() => false);
      
      let deepsecFindings = [];
      let deepsecMessage = "";

      if (hasDeepsec) {
        // Orchestrate Vercel Labs deepsec AI vulnerability scanner
        try {
          await $`cd ${deepsecDir} && pnpm deepsec scan`;
          const findingsDir = path.join(deepsecDir, 'findings');
          await $`cd ${deepsecDir} && pnpm deepsec export --format md-dir --out ./findings`;
          
          // Parse exported markdown findings
          const hasFindings = await fs.access(findingsDir).then(() => true).catch(() => false);
          if (hasFindings) {
            const files = await fs.readdir(findingsDir);
            for (const file of files) {
              if (file.endsWith('.md')) {
                const content = await fs.readFile(path.join(findingsDir, file), 'utf-8');
                deepsecFindings.push({
                  id: file.replace('.md', ''),
                  severity: "HIGH", // Deepsec typically surfaces high-value logical flaws
                  description: content.length > 800 ? content.substring(0, 800) + '...' : content,
                  confidence: 1.0
                });
              }
            }
          }
          deepsecMessage = `Deepsec AI Agent scanned the codebase and discovered ${deepsecFindings.length} vulnerabilities.`;
        } catch (err) {
          console.warn("Deepsec scan failed, falling back to npm audit:", err);
          deepsecMessage = "Deepsec scan failed during execution. Falling back to NPM Audit heuristics.";
        }
      } else {
        deepsecMessage = "Deepsec AI Agent is not initialized in this repository. Run `npx deepsec init` to enable deep AI-powered vulnerability scanning from vercel-labs/deepsec. Falling back to NPM Audit heuristics.";
      }

      // Run npm audit as a real security heuristic baseline
      let auditSummary = { high: 0, moderate: 0, low: 0, critical: 0 };
      try {
        const auditOutput = await $`npm audit --json`;
        const auditData = JSON.parse(auditOutput.stdout);
        if (auditData.metadata && auditData.metadata.vulnerabilities) {
          auditSummary = auditData.metadata.vulnerabilities;
        }
      } catch (auditErr) {
        if (auditErr.stdout) {
          try {
            const auditData = JSON.parse(auditErr.stdout);
            if (auditData.metadata && auditData.metadata.vulnerabilities) {
              auditSummary = auditData.metadata.vulnerabilities;
            }
          } catch (e) {
            // Ignore parse errors from audit fallback
          }
        }
      }
      
      const totalVulns = (auditSummary.high || 0) + (auditSummary.moderate || 0) + (auditSummary.low || 0) + (auditSummary.critical || 0);
      
      const finalResults = [...deepsecFindings];
      if (totalVulns > 0) {
        finalResults.push({
          id: "DS-NPM-AUDIT",
          severity: (auditSummary.critical > 0) ? "CRITICAL" : (auditSummary.high > 0) ? "HIGH" : "MEDIUM",
          description: `NPM dependency vulnerabilities detected. Run 'npm audit' for full CVE details.`,
          confidence: 1.0
        });
      }

      return {
        deepsec_initialized: hasDeepsec,
        summary: {
          high: auditSummary.high || 0,
          medium: auditSummary.moderate || 0,
          low: auditSummary.low || 0,
          critical: auditSummary.critical || 0
        },
        message: deepsecMessage,
        results: finalResults
      };
    } catch (error) {
      console.error("Deepsec execution error:", error);
      return {
        message: "Deepsec agent execution failed.",
        error: error.message,
        summary: { high: 0, medium: 0, low: 0, critical: 0 },
        results: []
      };
    }
  }
};
