import { Router } from 'express';
import UsersRouter from './users.router';
const router = Router();

router.use('/user', UsersRouter);

export = router;
