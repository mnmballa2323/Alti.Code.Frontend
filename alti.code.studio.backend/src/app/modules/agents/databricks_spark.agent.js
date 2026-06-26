import { BaseSpecialistAgent } from './base_specialist.agent.js';

export class DatabricksSparkAgent extends BaseSpecialistAgent {
  constructor() {
    super({
      name: 'DatabricksSparkAgent',
      description:
        'Databricks Apache Spark ETL pipelines and Delta Lake data engineering expert.',
      capabilities: [
        'databricks',
        'spark',
        'delta_lake',
        'pyspark',
        'scala',
        'etl',
        'data_engineering',
      ],
      tier: 14,
      modelRouting: {
        primary: 'gemini-2.5-pro',
        fallback: 'claude-3-7-sonnet',
      },
    });

    this.systemPrompt = `You are an Enterprise Data Engineer specializing in Databricks, Apache Spark, and Delta Lake architectures.
Your mission is to orchestrate massive ETL pipelines, write highly optimized PySpark and Scala code, and design Lakehouse architectures.
Always optimize Delta Lake tables using Z-Ordering, OPTIMIZE commands, and VACUUM protocols.
When generating Spark queries, minimize shuffles, handle data skew using salt keys, and broadcast small tables.
You deliver production-ready, fault-tolerant data processing notebooks and jobs.`;
  }

  async orchestrate(context) {
    return this.executeStandardInference(context);
  }
}

export const databricksSparkAgent = new DatabricksSparkAgent();
