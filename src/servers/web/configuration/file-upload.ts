import multer from 'multer';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { IUser } from '../../../database/models/user';

const homedir = os.homedir();
let webSimAdminDir = path.join(homedir, '.websimadmin');
let uploadsDir = path.join(webSimAdminDir, 'uploads');

if (!fs.existsSync(webSimAdminDir)) {
  fs.mkdirSync(webSimAdminDir);
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void): void => {
    callback(null, uploadsDir);
  },
  filename: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void): void => {
    callback(null, (req.user as IUser)._id + '-' + Date.now() + '-' + file.originalname);
  }
});

export const upload = multer({ storage: storage });
