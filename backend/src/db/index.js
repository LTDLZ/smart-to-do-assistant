import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from '../config.js';

// Make sure the folder that holds the database file exists.
fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });

/** Shared database connection for the whole process. */
const db = new Database(config.dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Create the tables from the schema file. Safe to call on every start
 * because the schema uses `CREATE TABLE IF NOT EXISTS`.
 */
export function initDatabase() {
  const schema = fs.readFileSync(config.schemaFile, 'utf8');
  db.exec(schema);
  return db;
}

export default db;
