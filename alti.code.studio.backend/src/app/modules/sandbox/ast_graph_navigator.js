import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../../shared/logger.js';
import { neo4jService } from '../../services/neo4j.service.js';

export class AstGraphNavigator {
  static pendingSyncPaths = new Set();
  static resolveCallbacks = [];
  static debounceTimer = null;
  static debounceDelay = 2000;

  /**
   * Parses a JS/TS file to build a map of its symbol definitions (classes, functions, methods).
   * @param {string} filePath - Absolute path to the file
   * @returns {object} Graph structure mapping symbol names to their line locations and contents
   */
  static buildGraph(filePath) {
    if (!fs.existsSync(filePath)) {
      logger.warn(`[AST Graph Navigator] File not found: ${filePath}`);
      return { symbols: {} };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const symbols = {};

    // Match patterns for class, function, and method definitions
    const classRegex = /(?:export\s+)?class\s+(\w+)/;
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/;
    const methodRegex = /^(?:\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/;
    const arrowFuncRegex =
      /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/;

    let currentClass = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // 1. Detect Class
      const classMatch = classRegex.exec(line);
      if (classMatch) {
        currentClass = classMatch[1];
        symbols[currentClass] = {
          name: currentClass,
          type: 'class',
          startLine: lineNum,
          endLine: lineNum, // Updated below
          methods: [],
        };
        continue;
      }

      // 2. Detect Function
      const funcMatch = functionRegex.exec(line);
      if (funcMatch) {
        const name = funcMatch[1];
        symbols[name] = {
          name,
          type: 'function',
          startLine: lineNum,
          endLine: lineNum,
        };
        continue;
      }

      // 3. Detect Arrow Function
      const arrowMatch = arrowFuncRegex.exec(line);
      if (arrowMatch) {
        const name = arrowMatch[1];
        symbols[name] = {
          name,
          type: 'arrow_function',
          startLine: lineNum,
          endLine: lineNum,
        };
        continue;
      }

      // 4. Detect Method inside Class
      const methodMatch = methodRegex.exec(line);
      if (methodMatch && currentClass) {
        const name = methodMatch[1];
        if (
          name !== 'if' &&
          name !== 'for' &&
          name !== 'while' &&
          name !== 'switch'
        ) {
          const key = `${currentClass}.${name}`;
          symbols[key] = {
            name,
            type: 'method',
            parentClass: currentClass,
            startLine: lineNum,
            endLine: lineNum,
          };
          symbols[currentClass].methods.push(name);
        }
      }
    }

    // Determine symbol end lines by matching brackets
    const symbolKeys = Object.keys(symbols);
    for (const key of symbolKeys) {
      const sym = symbols[key];
      sym.endLine = this._findClosingBracketLine(lines, sym.startLine);
    }

    return { symbols };
  }

  /**
   * Extracts only the specified symbol's definition and its JSDoc comments to prune context size.
   * @param {string} filePath - Absolute path to file
   * @param {string} symbolName - e.g., 'DatabaseSync' or 'CodeExecutionSandbox.execute'
   * @returns {string} The pruned code snippet
   */
  static pruneFile(filePath, symbolName) {
    if (!fs.existsSync(filePath)) return '';

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const graph = this.buildGraph(filePath);
    const sym = graph.symbols[symbolName];

    if (!sym) {
      logger.debug(
        `[AST Graph Navigator] Symbol [${symbolName}] not found in ${filePath}. Returning raw file.`,
      );
      return content;
    }

    // Include any JSDoc/comments immediately preceding the symbol start line
    let commentStart = sym.startLine - 1;
    while (commentStart > 0) {
      const prevLine = lines[commentStart - 1].trim();
      if (
        prevLine.startsWith('/**') ||
        prevLine.startsWith('*') ||
        prevLine.startsWith('*/') ||
        prevLine.startsWith('//')
      ) {
        commentStart--;
      } else {
        break;
      }
    }

    const prunedLines = lines.slice(commentStart, sym.endLine);
    return prunedLines.join('\n');
  }

  /**
   * Helper to locate the closing brace of a code block.
   */
  static _findClosingBracketLine(lines, startLine) {
    let openBrackets = 0;
    let foundBracket = false;

    for (let i = startLine - 1; i < lines.length; i++) {
      const line = lines[i];

      for (let char of line) {
        if (char === '{') {
          openBrackets++;
          foundBracket = true;
        } else if (char === '}') {
          openBrackets--;
        }
      }

      if (foundBracket && openBrackets <= 0) {
        return i + 1; // 1-indexed line number
      }
    }

    return lines.length; // Fallback to EOF
  }

  /**
   * Parses the file symbols and synchronizes them to Neo4j, debounced to avoid locks.
   * @param {string} filePath - Absolute path to the file
   */
  static async syncFileToNeo4j(filePath) {
    return new Promise((resolve, reject) => {
      this.pendingSyncPaths.add(filePath);
      this.resolveCallbacks.push({ filePath, resolve, reject });

      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(async () => {
        this.debounceTimer = null;
        const pathsToProcess = Array.from(this.pendingSyncPaths);
        const callbacksToProcess = [...this.resolveCallbacks];

        this.pendingSyncPaths.clear();
        this.resolveCallbacks = [];

        for (const path of pathsToProcess) {
          try {
            await this._syncFileToNeo4jInternal(path);
            const pathCallbacks = callbacksToProcess.filter(
              cb => cb.filePath === path,
            );
            for (const cb of pathCallbacks) {
              cb.resolve();
            }
          } catch (err) {
            const pathCallbacks = callbacksToProcess.filter(
              cb => cb.filePath === path,
            );
            for (const cb of pathCallbacks) {
              cb.reject(err);
            }
          }
        }
      }, this.debounceDelay);
    });
  }

  /**
   * Internal direct sync helper.
   */
  static async _syncFileToNeo4jInternal(filePath) {
    if (!fs.existsSync(filePath)) {
      logger.warn(`[AST Neo4j Sync] File not found: ${filePath}`);
      return;
    }

    const relativePath = path.relative(process.cwd(), filePath);
    logger.info(`[AST Neo4j Sync] Syncing ${relativePath} to Neo4j...`);

    const graph = this.buildGraph(filePath);
    const symbols = graph.symbols;

    try {
      // Merge file node first
      await neo4jService.executeCypher(
        'MERGE (f:File {path: $path}) SET f.name = $name, f.lastUpdated = datetime()',
        { path: relativePath, name: path.basename(filePath) },
      );

      for (const [key, sym] of Object.entries(symbols)) {
        const nodeId = `\${relativePath}:\${key}`;

        // Create AstSymbol node
        await neo4jService.executeCypher(
          `MERGE (s:AstSymbol {id: $id})
                     SET s.name = $name, s.type = $type, s.filePath = $filePath, s.startLine = $startLine, s.endLine = $endLine`,
          {
            id: nodeId,
            name: sym.name,
            type: sym.type,
            filePath: relativePath,
            startLine: sym.startLine,
            endLine: sym.endLine,
          },
        );

        // Connect symbol to the File node
        await neo4jService.executeCypher(
          `MATCH (f:File {path: $filePath})
                     MATCH (s:AstSymbol {id: $id})
                     MERGE (f)-[:CONTAINS]->(s)`,
          { filePath: relativePath, id: nodeId },
        );

        // Connect method to its parent class if applicable
        if (sym.type === 'method' && sym.parentClass) {
          const parentId = `\${relativePath}:\${sym.parentClass}`;
          await neo4jService.executeCypher(
            `MATCH (c:AstSymbol {id: $parentId})
                         MATCH (m:AstSymbol {id: $id})
                         MERGE (c)-[:HAS_METHOD]->(m)`,
            { parentId, id: nodeId },
          );
        }
      }

      // Parse imports/requires to construct :DEPENDS_ON relationships
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Match standard ES6 imports or require statements
      const importRegex =
        /(?:import\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"])|(?:require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

      for (const line of lines) {
        let match;
        while ((match = importRegex.exec(line)) !== null) {
          const importPath = match[1] || match[2];
          if (
            importPath &&
            (importPath.startsWith('.') || importPath.startsWith('/'))
          ) {
            // Resolve relative import to relative path from root
            const absoluteImport = path.resolve(
              path.dirname(filePath),
              importPath,
            );
            // Handle JS file extension resolution
            let resolvedImport = absoluteImport;
            if (
              !resolvedImport.endsWith('.js') &&
              !resolvedImport.endsWith('.ts')
            ) {
              if (fs.existsSync(resolvedImport + '.js')) {
                resolvedImport += '.js';
              } else if (fs.existsSync(resolvedImport + '/index.js')) {
                resolvedImport += '/index.js';
              }
            }

            const relativeImportPath = path.relative(
              process.cwd(),
              resolvedImport,
            );

            // Create referenced file node and link
            await neo4jService.executeCypher(
              `MERGE (target:File {path: $targetPath})
                             ON CREATE SET target.name = $name
                             WITH target
                             MATCH (source:File {path: $sourcePath})
                             MERGE (source)-[:DEPENDS_ON]->(target)`,
              {
                targetPath: relativeImportPath,
                name: path.basename(resolvedImport),
                sourcePath: relativePath,
              },
            );
          }
        }
      }
    } catch (error) {
      logger.error(
        `[AST Neo4j Sync] Failed to sync to Neo4j: \${error.message}`,
      );
    }
  }
}
