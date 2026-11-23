import { Router } from 'express';
import tasksRouter from './tasks.routes.js';
import adminRouter from './admin.routes.js';

const router = Router();

router.use('/tasks', tasksRouter);
router.use('/load-sample-data', adminRouter);

export default router;
