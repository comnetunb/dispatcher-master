import { model, Schema, Document, Model } from 'mongoose';

interface IRunnableInfoDocument extends Document {
  type: string,
  extension: string,
}

export interface IRunnableInfo extends IRunnableInfoDocument {

}

interface IRunnableInfoModel extends Model<IRunnableInfo> {
  Java: IRunnableInfo,
  Python: IRunnableInfo,
}

const runnableInfoSchema: Schema = new Schema({
  type: {
    type: String,
    required: true
  },
  extension: {
    type: String,
    required: true
  }
});

runnableInfoSchema.statics.Java = { type: 'java', extension: '.jar' };
runnableInfoSchema.statics.Python = { type: 'python', extension: '.py' };

export const RunnableInfo: IRunnableInfoModel = model<IRunnableInfo, IRunnableInfoModel>('RunnableInfo', runnableInfoSchema);

export default RunnableInfo;
