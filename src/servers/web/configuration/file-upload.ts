import multer from 'multer';
import * as fs from 'fs';

const uploadsDir = '/tmp/websimadmin/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void): void => {
    callback(null, uploadsDir);
  },
  filename: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void): void => {
    callback(null, Date.now() + '-' + file.originalname);
  }
});

export const upload = multer({ storage: storage });
