import path from 'node:path';
import process from 'node:process';

/** Absolute path to the `backend/` folder (this file lives in `backend/src/`). */
const rootDir = path.resolve(import.meta.dirname, '..');

/** Resolve a possibly-relative path from the backend root. */
const fromRoot = (value) => path.resolve(rootDir, value);

export const config = {
  rootDir,
  port: Number(process.env.PORT) || 3000,
  environment: process.env.NODE_ENV || 'development',
  dbFile: process.env.DB_FILE ? fromRoot(process.env.DB_FILE) : path.join(rootDir, 'data', 'tasks.db'),
  schemaFile: path.join(rootDir, 'src', 'db', 'schema.sql'),
  sampleDataFile: process.env.SAMPLE_DATA_FILE
    ? fromRoot(process.env.SAMPLE_DATA_FILE)
    : path.join(rootDir, 'data', 'sample-tasks.csv'),
};
