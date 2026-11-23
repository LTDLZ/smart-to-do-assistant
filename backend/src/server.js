import process from 'node:process';
import { createApp } from './app.js';
import { config } from './config.js';
import { initDatabase } from './db/index.js';

initDatabase();
const app = createApp();

app.listen(config.port, () => {
  console.log(`Smart To-Do Assistant API listening on http://localhost:${config.port}`);
  console.log(`Database: ${config.dbFile}`);
});

process.on('SIGINT', () => {
  console.log('\nShutting down.');
  process.exit(0);
});
