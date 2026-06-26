/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class AnalyticsAgent {
  constructor() {
    this.name = 'analytics';
    this.description = 'Autonomous Data Scientist and Visualization Expert';
    this.capabilities = [
      'Ingest raw unstructured CSV/JSON datasets',
      'Perform ETL aggregations (grouping, summing, dropping nulls)',
      'Generate Mermaid Pie Charts or data visualization representations natively',
    ];
  }

  /**
   * Ingests a raw dataset and a query intent to generate data insights and visualization code.
   * @param {string} dataset Raw JSON or CSV snippet
   * @param {string} analysisGoal What the user wants to know (e.g. "Sales by Region")
   */
  async evaluateDataset(dataset, analysisGoal) {
    logger.info(
      `📊 Analytics Agent: Booting ETL pipeline to analyze raw dataset: "${analysisGoal}"...`,
    );

    try {
      const prompt = `
            You are a Senior Data Scientist analyzing the provided raw dataset.
            Goal: ${analysisGoal}
            
            Dataset Context (Truncated):
            \`\`\`
            ${dataset.substring(0, 3000)}
            \`\`\`

            Perform mental map-reduce/grouping logic. Aggregate the data dimensions related to the Goal.
            
            Return your findings as a strict JSON report:
            {
                "dataInsight": "A 1-sentence mathematical conclusion (e.g., 'North America leads sales with $45K.')",
                "aggregatedMetrics": { "key1": "value1", "key2": "value2" },
                "mermaidChart": "A fully rendered Mermaid.js Pie Chart or Bar Graph visually representing your aggregated findings."
            }
            Do not wrap the JSON output in markdown formatting. Ensure the mermaid string is correct syntax.
            `;

      const rawResponse = await GeminiAiService.generateContent(prompt);
      const reportJson = rawResponse
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();
      const analyticsReport = JSON.parse(reportJson);

      logger.info(`📊 Analytics Agent Insight: ${analyticsReport.dataInsight}`);

      return analyticsReport;
    } catch (err) {
      logger.error(`❌ Analytics Agent ETL Failed: ${err.message}`);
      throw err;
    }
  }

  async process(state) {
    const dataset = state.data?.content || '[]';
    const goal = state.data?.context || state.goal || 'Analyze generic dataset';

    const report = await this.evaluateDataset(dataset, goal);

    return {
      ...state,
      status: 'success',
      results: [
        ...(state.results || []),
        `Analytics Generated: ${report.dataInsight}`,
      ],
    };
  }
}

export const analyticsAgent = new AnalyticsAgent();
