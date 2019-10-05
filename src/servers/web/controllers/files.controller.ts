import { Request, Response } from 'express';
import File, { IFile } from '../../../database/models/file';

export async function fileUploadNext(req: Request, res: Response): Promise<void> {
  const promises: Promise<any>[] = [];
  const files: IFile[] = [];

  for (let i = 0; i < req.files.length; i++) {
    promises.push(new Promise(async (resolve, reject) => {
      const multerFile: Express.Multer.File = req.files[i];
      let file = new File({
        name: multerFile.originalname,
        encoding: multerFile.encoding,
        mimetype: multerFile.mimetype,
        path: multerFile.path,
        size: multerFile.size,
        _user: req.user._id,
      });

      try {
        files.push(await file.save());
        resolve();
      } catch (err) {
        reject(err);
      }
    }))
  }

  await Promise.all(promises);
  res.send(files);
}
