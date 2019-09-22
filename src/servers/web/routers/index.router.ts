import { Router } from 'express';
import UsersRouter from './users.router';
import LogsRouter from './logs.router';
import TasksRouter from './tasks.router';
const router = Router();

router.use('/users', UsersRouter);
router.use('/logs', LogsRouter);
router.use('/tasks', TasksRouter);

export = router;
