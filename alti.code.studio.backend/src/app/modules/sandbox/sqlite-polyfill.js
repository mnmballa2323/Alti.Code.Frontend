/**
 * SQLite Polyfill for Node.js < v22.5.0
 * Mocks the node:sqlite built-in module to prevent resolution errors.
 */
export class DatabaseSync {
  constructor(filename) {
    this.filename = filename;
    this.tables = {};
  }

  exec(sql) {
    return { changes: 0 };
  }

  prepare(sql) {
    return {
      all: (...args) => [],
      run: (...args) => ({ changes: 0, lastInsertRowid: 1 }),
      get: (...args) => null,
    };
  }
}
