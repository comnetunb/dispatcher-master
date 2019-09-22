import { Router } from 'express';
import * as UserController from '../controllers/users.controller';
const router = Router();

router.post('/sign_in', UserController.signIn);
router.post('/sign_up', UserController.signUp);
router.post('/sign_out', UserController.signOut);
router.get('/signed_in', UserController.isSignedIn);

router.post('/manage/:id', UserController.manageUser);

router.get('/pending', UserController.pendingUsers);
router.get('/allowed', UserController.allowedUsers);
router.get('/disallowed', UserController.disallowedUsers);

export = router;
