import { Router } from 'express';
import * as GraphsController from '../controllers/graphs.controller';
const router = Router();

router.get('/:taskSetId/info', GraphsController.plotInfo);
router.post('/:taskSetId/data', GraphsController.plotData);

export = router;
