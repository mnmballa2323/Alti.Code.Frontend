import { Spanner } from '@google-cloud/spanner';
import { logger } from '../../../shared/logger.js';

class GcpSpannerGraphService {
  constructor() {
    this.spanner = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.GCP_REAL_SERVICES === 'true'
      ) {
        if (
          process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          process.env.GCP_PROJECT_ID
        ) {
          this.spanner = new Spanner();
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ Google Cloud Spanner initialization failed, falling back to local mock traversal: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Execute Spanner Graph traversal using real Spanner SQL with graph extensions.
   * Falls back to mock traversal when Spanner is not initialized.
   */
  async executeAstGraphTraversal(startNodeId, hops = 3) {
    if (this.isInitialized && this.spanner) {
      try {
        const instanceId = process.env.SPANNER_INSTANCE_ID || 'alti-instance';
        const databaseId = process.env.SPANNER_DATABASE_ID || 'alti-graph-db';
        const instance = this.spanner.instance(instanceId);
        const database = instance.database(databaseId);

        logger.info(
          `🕸️ Google Cloud Spanner Graph: Running BFS traversal from ${startNodeId} (${hops} hops)`,
        );

        // Spanner Graph query using GRAPH_TABLE syntax for traversal
        const query = {
          sql: `
            SELECT node_id, node_type, depth, parent_id
            FROM GRAPH_TABLE(
              AstGraph
              MATCH (root:AstNode WHERE root.node_id = @startNodeId)
                -[edge:DependsOn]->{1,@maxHops}
                (target:AstNode)
              COLUMNS (
                target.node_id AS node_id,
                target.node_type AS node_type,
                edge.depth AS depth,
                root.node_id AS parent_id
              )
            )
            ORDER BY depth ASC
            LIMIT 100
          `,
          params: { startNodeId, maxHops: hops },
          types: {
            startNodeId: { type: 'string' },
            maxHops: { type: 'int64' },
          },
        };

        const [rows] = await database.run(query);
        const results = rows.map((row) => ({
          id: row[0]?.value || row[0],
          type: row[1]?.value || row[1],
          depth: Number(row[2]?.value || row[2] || 0),
          parentId: row[3]?.value || row[3],
        }));

        logger.info(
          `🕸️ Google Cloud Spanner Graph: Traversal returned ${results.length} nodes`,
        );
        return results;
      } catch (e) {
        logger.error(`❌ Spanner Graph traversal failed: ${e.message}. Falling back to mock.`);
      }
    }

    logger.info(
      `🕸️ Google Cloud Spanner Graph Mock: Traversing AST Graph from ${startNodeId} with ${hops} hops...`,
    );
    return [
      { id: startNodeId, type: 'node', depth: 0, parentId: null },
      { id: 'ast-child-1', type: 'node', depth: 1, parentId: startNodeId },
    ];
  }

  /**
   * Query dependency mapping in Google Cloud Spanner Graph.
   * Uses real Spanner queries when available, falls back to empty results.
   */
  async queryArchitectureDependencies(type) {
    if (this.isInitialized && this.spanner) {
      try {
        const instanceId = process.env.SPANNER_INSTANCE_ID || 'alti-instance';
        const databaseId = process.env.SPANNER_DATABASE_ID || 'alti-graph-db';
        const instance = this.spanner.instance(instanceId);
        const database = instance.database(databaseId);

        logger.info(
          `🕸️ Google Cloud Spanner Graph: Querying ${type} dependencies`,
        );

        const query = {
          sql: `
            SELECT source_id, target_id, dependency_type, weight
            FROM ArchitectureDependencies
            WHERE dependency_type = @depType
            ORDER BY weight DESC
            LIMIT 50
          `,
          params: { depType: type },
          types: { depType: { type: 'string' } },
        };

        const [rows] = await database.run(query);
        return rows.map((row) => ({
          sourceId: row[0]?.value || row[0],
          targetId: row[1]?.value || row[1],
          type: row[2]?.value || row[2],
          weight: Number(row[3]?.value || row[3] || 0),
        }));
      } catch (e) {
        logger.error(`❌ Spanner dependency query failed: ${e.message}`);
      }
    }

    logger.info(
      `🕸️ Google Cloud Spanner Graph Mock: Querying architectural dependencies for type: ${type}`,
    );
    return [];
  }

  /**
   * Find shortest path between two nodes in the Spanner Graph.
   */
  async findShortestPath(sourceNodeId, targetNodeId) {
    if (this.isInitialized && this.spanner) {
      try {
        const instanceId = process.env.SPANNER_INSTANCE_ID || 'alti-instance';
        const databaseId = process.env.SPANNER_DATABASE_ID || 'alti-graph-db';
        const instance = this.spanner.instance(instanceId);
        const database = instance.database(databaseId);

        logger.info(
          `🕸️ Google Cloud Spanner Graph: Finding shortest path ${sourceNodeId} → ${targetNodeId}`,
        );

        const query = {
          sql: `
            SELECT path_node_id, path_depth
            FROM GRAPH_TABLE(
              AstGraph
              MATCH SHORTEST (source:AstNode WHERE source.node_id = @sourceId)
                -[edge:DependsOn]->+
                (target:AstNode WHERE target.node_id = @targetId)
              COLUMNS (
                target.node_id AS path_node_id,
                edge.depth AS path_depth
              )
            )
          `,
          params: { sourceId: sourceNodeId, targetId: targetNodeId },
          types: {
            sourceId: { type: 'string' },
            targetId: { type: 'string' },
          },
        };

        const [rows] = await database.run(query);
        return rows.map((row) => ({
          nodeId: row[0]?.value || row[0],
          depth: Number(row[1]?.value || row[1] || 0),
        }));
      } catch (e) {
        logger.error(`❌ Spanner shortest path failed: ${e.message}`);
      }
    }

    logger.info(
      `🕸️ Google Cloud Spanner Graph Mock: Finding path ${sourceNodeId} → ${targetNodeId}`,
    );
    return [
      { nodeId: sourceNodeId, depth: 0 },
      { nodeId: targetNodeId, depth: 1 },
    ];
  }
}

export const gcpSpannerGraphService = new GcpSpannerGraphService();
export const spannerGraphService = gcpSpannerGraphService;
