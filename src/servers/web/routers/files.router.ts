import { Router } from 'express';
import * as FilesController from '../controllers/files.controller';
import { upload } from '../configuration/file-upload';

const router = Router();

router.post('/upload', upload.single('file'), FilesController.fileUploadNext);
router.post('/upload-multiple', upload.array('files'), FilesController.multipleFileUploadNext);

export = router;
