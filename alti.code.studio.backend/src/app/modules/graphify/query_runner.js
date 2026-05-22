import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main query execution logic
function run() {
  const args = process.argv.slice(2);
  const targetRelPath = args[0] || 'alti.code.studio.backend/src';
  const limitArg = parseInt(args[1], 10) || 150;

  try {
    const dbPath = path.resolve(__dirname, '../../../../../.codegraph/codegraph.db');
    const db = new DatabaseSync(dbPath);

    // 1. Fetch files under the target directory
    const filesQuery = db.prepare(`
      SELECT id, name, file_path, language, kind 
      FROM nodes 
      WHERE kind = 'file' AND file_path LIKE ? 
      ORDER BY length(file_path) ASC, name ASC 
      LIMIT ?
    `);
    
    const files = filesQuery.all(`${targetRelPath}%`, limitArg);
    
    if (files.length === 0) {
      console.log(JSON.stringify({ nodes: [], links: [] }));
      return;
    }

    const fileIds = files.map(f => f.id);
    const fileIdSet = new Set(fileIds);

    // 2. Fetch classes, functions, and routes contained in these files
    // Using placeholders dynamically
    const placeholders = fileIds.map(() => '?').join(',');
    const childrenQuery = db.prepare(`
      SELECT id, name, file_path, language, kind, signature 
      FROM nodes 
      WHERE file_path IN (${placeholders}) AND kind IN ('class', 'function', 'method', 'route')
      LIMIT 250
    `);
    
    const children = childrenQuery.all(...fileIds);
    const allNodes = [...files, ...children];
    const allNodeIds = allNodes.map(n => n.id);
    const allNodeIdSet = new Set(allNodeIds);

    // 3. Fetch all edges connecting any of these nodes
    // Since SQL IN list can be long, let's chunk it if necessary, but 400 items is small enough for SQLite.
    const allPlaceholders = allNodeIds.map(() => '?').join(',');
    const edgesQuery = db.prepare(`
      SELECT source, target, kind 
      FROM edges 
      WHERE source IN (${allPlaceholders}) AND target IN (${allPlaceholders})
    `);
    
    // SQLite query takes source list first, target list second
    const edges = edgesQuery.all(...allNodeIds, ...allNodeIds);

    // 4. Map to ForceGraph3D contract
    // We assign groups to node kinds to color them beautifully
    // Files: 2 (Green)
    // Classes: 3 (Blue)
    // Functions: 4 (Purple)
    // Routes: 5 (Orange)
    const kindToGroup = {
      'file': 2,
      'class': 3,
      'function': 4,
      'method': 4,
      'route': 5
    };

    const formattedNodes = allNodes.map(node => {
      // Map file extensions to dynamic subgroups if it is a file, to cluster visually
      let group = kindToGroup[node.kind] || 1;
      if (node.kind === 'file') {
        const ext = path.extname(node.name);
        if (ext === '.js') group = 2;
        else if (ext === '.ts' || ext === '.tsx') group = 3;
        else if (ext === '.py') group = 4;
        else group = 6;
      }

      // Assign visual weights/sizes
      let val = 4;
      if (node.kind === 'file') val = 12;
      else if (node.kind === 'class') val = 8;
      else if (node.kind === 'route') val = 10;

      return {
        id: node.id,
        name: node.name || node.id,
        group,
        val,
        kind: node.kind,
        filePath: node.file_path,
        language: node.language,
        signature: node.signature || undefined
      };
    });

    const formattedLinks = edges.map(edge => {
      let value = 2;
      if (edge.kind === 'contains') value = 1;
      else if (edge.kind === 'imports') value = 4;
      else if (edge.kind === 'calls') value = 3;

      return {
        source: edge.source,
        target: edge.target,
        value,
        kind: edge.kind
      };
    });

    console.log(JSON.stringify({
      nodes: formattedNodes,
      links: formattedLinks
    }));

  } catch (error) {
    console.error('Error executing query runner:', error.message);
    process.exit(1);
  }
}

run();
