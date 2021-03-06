import { Router } from 'express';
import * as FilesController from '../controllers/files.controller';
import { upload } from '../configuration/file-upload';

const router = Router();

router.get('/', FilesController.getUserFiles);
router.get('/:id', FilesController.getFile);
router.delete('/:id', FilesController.deleteFile);
router.post('/upload', upload.single('file'), FilesController.fileUploadNext);
router.post('/upload-multiple', upload.array('files'), FilesController.multipleFileUploadNext);

export = router;
