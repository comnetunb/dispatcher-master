import { Router } from 'express';
import * as TasksController from '../controllers/tasks.controller';
const router = Router();

router.get('/from-taskset/:tasksetId', TasksController.getTasks);
router.post('/:taskId/discard', TasksController.discardTask);
router.post('/:taskId/cancel', TasksController.discardTask);

export = router;
