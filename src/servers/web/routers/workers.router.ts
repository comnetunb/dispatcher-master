import { Router } from 'express';
import * as WorkersController from '../controllers/workers.controller';
const router = Router();

router.get('/', WorkersController.getAllWorkers);
router.get('/:address/pause', WorkersController.pauseWorker);
router.get('/:address/resume', WorkersController.resumeWorker);
router.get('/:address/stop', WorkersController.stopWorker);

export = router;
