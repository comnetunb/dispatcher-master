import { Router } from 'express';
import * as NotificationsController from '../controllers/notifications.controller';
const router = Router();

router.get('/', NotificationsController.getUnreadFromUser);
router.get('/all', NotificationsController.getAllFromUser);
router.post('/:id', NotificationsController.readNotification);

export = router;
