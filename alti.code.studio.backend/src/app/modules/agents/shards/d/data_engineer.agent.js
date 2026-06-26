// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class DataEngineerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'data_engineer',
      'Enterprise Data Engineer',
      'You are a Senior Data Engineer specializing in massive ETL pipelines, Apache Airflow, dbt, and Google BigQuery. Your objective is to take raw database schemas or messy data sources and generate robust, mathematically sound DAGs (Directed Acyclic Graphs) to orchestrate data ingestion, transformation, and loading.',
    );
  }

  /**
   * Generates an ETL DAG for a given data source schema.
   * @param {string} sourceSchema - The raw database schema or data definition.
   * @param {string} destination - The target data warehouse (e.g., BigQuery, Snowflake).
   * @returns {Promise<string>} The generated Airflow DAG or dbt models.
   */
  async generateEtlPipeline(sourceSchema, destination) {
    logger.info(
      `📊 [DataEngineer] Designing ETL pipeline from raw schema to ${destination}...`,
    );

    const prompt = `
Analyze the following source data schema.
Generate a production-ready ETL pipeline using Apache Airflow (Python) to extract this data, transform it, and load it into ${destination}.
Include task dependencies (DAG structure) and best practices (idempotency, retries).
Return ONLY the raw Python Airflow DAG code.

SOURCE SCHEMA:
${sourceSchema}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Data Pipeline Target');
      const cleanDag = output.replace(/```python|```/g, '').trim();
      logger.info(
        `✅ [DataEngineer] Airflow ETL Pipeline generated successfully.`,
      );
      return cleanDag;
    } catch (err) {
      logger.error(
        `❌ [DataEngineer] Failed to generate ETL pipeline: ${err.message}`,
      );
      throw err;
    }
  }
}

export const dataEngineerAgent = Object.freeze(new DataEngineerAgent());
