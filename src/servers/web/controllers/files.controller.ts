import { Request, Response } from 'express';
import File, { IFile } from '../../../database/models/file';
import HttpStatusCode from '../utils/httpStatusCodes';

export async function getUserFiles(req: Request, res: Response): Promise<void | Response> {
  const files = await File.find({ _user: req.user._id });
  return res.send(files);
}

export async function getFile(req: Request, res: Response): Promise<void | Response> {
  const fileId = req.params.id;
  const file = await File.findById(fileId);

  if (file == null) {
    return res.sendStatus(HttpStatusCode.NOT_FOUND);
  }

  if (!req.user.admin && file._user != req.user._id) {
    return res.sendStatus(HttpStatusCode.NOT_FOUND);
  }

  return res.send(file);
}

export async function deleteFile(req: Request, res: Response): Promise<void | Response> {
  const fileId = req.params.id;
  const file = await File.findById(fileId);

  if (file == null) {
    return res.sendStatus(HttpStatusCode.NOT_FOUND);
  }

  if (!req.user.admin && file._user != req.user._id) {
    return res.sendStatus(HttpStatusCode.NOT_FOUND);
  }

  await File.deleteOne({ _id: fileId });

  return res.sendStatus(HttpStatusCode.OK);
}

export async function fileUploadNext(req: Request, res: Response): Promise<void | Response> {
  let fileModel: IFile;

  const multerFile: Express.Multer.File = req.file;
  let file = new File({
    name: multerFile.originalname,
    encoding: multerFile.encoding,
    mimetype: multerFile.mimetype,
    path: multerFile.path,
    size: multerFile.size,
    _user: req.user._id,
  });

  try {
    fileModel = await file.save();
    return res.send(fileModel);
  } catch (error) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({ error });
  }

}
export async function multipleFileUploadNext(req: Request, res: Response): Promise<void> {
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
