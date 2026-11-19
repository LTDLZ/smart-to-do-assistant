import fs from 'node:fs';
import { Router } from 'express';
import { config } from '../config.js';
import { parseTasksCsv } from '../utils/csv.js';
import { appendTasks, countTasks, replaceTasks } from '../services/tasks.service.js';

const router = Router();

/**
 * GET /api/load-sample-data
 *
 * Admin endpoint. Reads the sample CSV file and loads it into the database.
 * Query params:
 *   - mode=replace (default) -> wipes the tasks table, then inserts the CSV rows
 *   - mode=append            -> adds the CSV rows on top of the existing ones
 */
router.get('/', (req, res, next) => {
  try {
    const mode = String(req.query.mode ?? 'replace').toLowerCase();
    if (!['replace', 'append'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid "mode". Use "replace" or "append".' });
    }

    if (!fs.existsSync(config.sampleDataFile)) {
      return res.status(500).json({
        error: `Sample data file not found at ${config.sampleDataFile}`,
      });
    }

    const csv = fs.readFileSync(config.sampleDataFile, 'utf8');
    const parsed = parseTasksCsv(csv);

    let inserted;
    if (mode === 'replace') {
      inserted = replaceTasks(parsed);
    } else {
      // On append, drop the CSV ids so SQLite assigns fresh ones and the
      // insert cannot collide with tasks that are already stored.
      const withoutIds = parsed.map((task) => ({ ...task, task_id: null }));
      inserted = appendTasks(withoutIds);
    }

    res.json({
      message: `Loaded ${inserted} task(s) from the sample CSV.`,
      mode,
      source: config.sampleDataFile,
      inserted,
      totalTasks: countTasks(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
