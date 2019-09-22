import { Router } from 'express';
import UsersRouter from './users.router';
import LogsRouter from './logs.router';
const router = Router();

router.use('/users', UsersRouter);
router.use('/logs', LogsRouter);

export = router;
