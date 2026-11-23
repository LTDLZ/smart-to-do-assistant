import { Router } from 'express';
import { listTasks } from '../services/tasks.service.js';

const router = Router();

/**
 * GET /api/tasks
 * Returns every task as a JSON array.
 */
router.get('/', (req, res) => {
  const tasks = listTasks();
  res.json(tasks);
});

export default router;
