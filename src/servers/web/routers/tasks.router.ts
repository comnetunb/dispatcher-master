import { Router } from 'express';
import * as TasksController from '../controllers/tasks.controller';
const router = Router();

router.get('/:tasksetId', TasksController.getTasks);

export = router;
