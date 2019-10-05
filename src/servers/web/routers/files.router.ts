import { Router } from 'express';
import * as FilesController from '../controllers/files.controller';
import { upload } from '../configuration/file-upload';

const router = Router();

router.post('/upload', upload.array('files'), FilesController.fileUploadNext);

export = router;
