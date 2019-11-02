import { Router } from 'express';
import * as NotificationsController from '../controllers/notifications.controller';
const router = Router();

router.get('/unread', NotificationsController.getUnreadFromUser);
router.get('/', NotificationsController.getAllFromUser);
router.post('/:id', NotificationsController.readNotification);

export = router;
