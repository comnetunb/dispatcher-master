import { Router } from 'express';
import * as LogsController from '../controllers/logs.controller';
const router = Router();

router.get('/', LogsController.getAllLogs);
router.get('/date', LogsController.getAllLogsStartingFromDate);

export = router;
