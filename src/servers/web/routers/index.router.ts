import { Router } from 'express';
import UsersRouter from './users.router';
import LogsRouter from './logs.router';
import TaskSetsRouter from './tasksets.router';
import TasksRouter from './tasks.router';
import NotificationsRouter from './notifications.router';
import WorkersRouter from './workers.router';
import GraphsRouter from './graphs.router';
import FilesRouter from './files.router';
const router = Router();

router.use('/users', UsersRouter);
router.use('/logs', LogsRouter);
router.use('/tasksets', TaskSetsRouter);
router.use('/tasks', TasksRouter);
router.use('/notifications', NotificationsRouter);
router.use('/workers', WorkersRouter);
router.use('/graphs', GraphsRouter);
router.use('/files', FilesRouter);

export = router;
