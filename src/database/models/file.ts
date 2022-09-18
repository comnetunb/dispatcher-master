import { model, Schema, Document, Model } from 'mongoose';
import { IUser } from './user';

interface IFileDocument extends Document {
  _user: IUser['_id'],
  name: string,
  encoding: string,
  mimetype: string,
  path: string,
  size: number,
  uploadTime: Date,
  content?: string,
}

export interface IFile extends IFileDocument {
}

interface IFileModel extends Model<IFile> {
}

const fileSchema: Schema = new Schema({
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  encoding: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  uploadTime: {
    type: Date,
    default: Date.now,
  },
});

export const File: IFileModel = model<IFile, IFileModel>('File', fileSchema);

export default File;

