import { model, Schema, Document, Model } from 'mongoose';
import { IUser } from './user';

interface IFileDocument extends Document {
  _user: IUser['_id'],
  name: String,
  dataURL: String,
}

export interface IFile extends IFileDocument {
}

interface IFileModel extends Model<IFile> {
}

const fileSchema: Schema = new Schema({
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dataURL: {
    type: String,
    required: true
  }
});

export const File: IFileModel = model<IFile, IFileModel>('File', fileSchema);

export default File;

