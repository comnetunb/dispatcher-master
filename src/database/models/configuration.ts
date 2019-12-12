import { model, Schema, Document, Model } from 'mongoose';

interface IConfigurationDocument extends Document {
  cpuLimit: number,
  memoryLimit: number,
  requestResourceInterval: number,
  dispatchInterval: number,
  emailService: string,
  emailUser: string,
  emailPassword: string,
  authTimeout: number,
}

export interface IConfiguration extends IConfigurationDocument {
}

interface IConfigurationModel extends Model<IConfiguration> {
  get(): Promise<IConfiguration>,
}

const configurationSchema: Schema = new Schema({
  cpuLimit: {
    type: Number,
    default: 0.25,
  },
  memoryLimit: {
    type: Number,
    default: 0.25,
  },
  requestResourceInterval: {
    type: Number,
    default: 1000,
  },
  dispatchInterval: {
    type: Number,
    default: 1000,
  },
  emailService: {
    type: String,
  },
  emailUser: {
    type: String,
  },
  emailPassword: {
    type: String,
  },
  authTimeout: {
    type: Number,
    default: 10000,
  },
});

configurationSchema.statics.get = async function (): Promise<IConfiguration> {
  let configuration = await Configuration.findOne({});
  if (!configuration) {
    let configuration = new Configuration({});
    await configuration.save();
  }
  return configuration;
};

export const Configuration: IConfigurationModel = model<IConfiguration, IConfigurationModel>('Configuration', configurationSchema);

export default Configuration;
