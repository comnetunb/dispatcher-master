import { Router } from 'express';
import * as TasksController from '../controllers/tasks.controller';
const router = Router();

router.get('/', TasksController.getAllTaskSets);
router.get('/export', TasksController.exportTaskSet);
router.get('/supported-runnables', TasksController.supportedRunnables);

router.post('/create-task-set', TasksController.createTaskSet);
router.post('/remove-task-set', TasksController.removeTaskSet);
router.post('/cancel-task-set', TasksController.cancelTaskSet);

router.get('/:id', TasksController.getTaskSet);

export = router;
