import { model, Schema, Document, Model } from 'mongoose';
import { compareSync, hashSync } from 'bcryptjs';

export interface IUserDocument extends Document {
  email: string,
  name: string,
  password: string,
  admin: boolean,
  pending: boolean,
  permitted: boolean,
}

export interface IUser extends IUserDocument {
  validPassword(password: string): boolean,
}

interface IUserModel extends Model<IUser> {
  encryptPassword(password: string): string,
}

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  pending: {
    type: Boolean,
    default: true,
  },
  permitted: {
    type: Boolean,
    required: false,
  }
});

const saltRounds = 10;

userSchema.statics.encryptPassword = (password: string): string => {
  return hashSync(password, saltRounds);
};

userSchema.methods.validPassword = function (password: string): boolean { // eslint-disable-line func-names
  return compareSync(password, this.password);
};

// Extending Request to properly type our users
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser
  }
  interface Response {
    user?: IUser
  }
}

export interface UserFilter {
  _id?: string,
  email?: string,
  name?: string,
  password?: string,
  admin?: boolean,
  pending?: boolean,
  permitted?: boolean,
}

export const User: IUserModel = model<IUser, IUserModel>('User', userSchema);

export default User;
