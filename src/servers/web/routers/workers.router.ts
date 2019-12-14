import { Router } from 'express';
import * as WorkersController from '../controllers/workers.controller';
const router = Router();

router.get('/', WorkersController.getAllWorkers);
router.post('/', WorkersController.createWorker);
router.get('/online', WorkersController.getOnlineWorkers);
router.post('/:address/pause', WorkersController.pauseWorker);
router.post('/:address/resume', WorkersController.resumeWorker);
router.post('/:address/stop', WorkersController.stopWorker);

export = router;
