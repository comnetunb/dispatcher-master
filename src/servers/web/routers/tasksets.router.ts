import { Router } from 'express';
import * as TaskSetsController from '../controllers/tasksets.controller';
const router = Router();

router.get('/', TaskSetsController.getTaskSets);
router.get('/export', TaskSetsController.exportTaskSet);
router.get('/supported-runnables', TaskSetsController.supportedRunnables);

router.post('/', TaskSetsController.createTaskSet);

router.post('/:id/cancel', TaskSetsController.cancelTaskSet);
router.get('/:id', TaskSetsController.getTaskSet);
router.delete('/:id', TaskSetsController.removeTaskSet);

export = router;
