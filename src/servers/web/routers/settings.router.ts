import { Router } from 'express';
import * as SettingsController from '../controllers/settings.controller';
const router = Router();

router.get('/', SettingsController.get);
router.post('/', SettingsController.set);

export = router;
