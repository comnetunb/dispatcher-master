import { Router } from 'express';
import * as TaskSetsController from '../controllers/tasksets.controller';
const router = Router();

router.get('/', TaskSetsController.getTaskSets);
router.get('/export', TaskSetsController.exportTaskSet);
router.get('/supported-runnables', TaskSetsController.supportedRunnables);

router.post('/', TaskSetsController.createTaskSet);
router.post('/remove-task-set', TaskSetsController.removeTaskSet);
router.post('/cancel-task-set', TaskSetsController.cancelTaskSet);

router.get('/:id', TaskSetsController.getTaskSet);

export = router;
