import { model, Schema, Document, Model } from 'mongoose';
import { compareSync, hashSync } from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { TestJWTKEY } from '../../servers/web/middlewares/auth';

export interface Token {
  token: string,
}

export interface IUserDocument extends Document {
  email: string,
  name: string,
  password: string,
  admin: boolean,
  pending: boolean,
  permitted: boolean,
  tokens: Token[],
}

export interface IUser extends IUserDocument {
  validPassword(password: string): boolean,
  generateAuthToken(): Promise<string>,
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
    unique: true,
    index: true,
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
    index: true,
  },
  permitted: {
    type: Boolean,
    required: false,
    index: true,
  },
  tokens: [{
    token: {
      type: String,
      required: true,
      index: true,
    }
  }]
});

const saltRounds = 10;

userSchema.statics.encryptPassword = (password: string): string => {
  return hashSync(password, saltRounds);
};

userSchema.methods.validPassword = function (password: string): boolean { // eslint-disable-line func-names
  return compareSync(password, this.password);
};

userSchema.methods.generateAuthToken = async function (): Promise<string> {
  // Generate an auth token for the user
  const user = this;
  const token = jwt.sign({ _id: user._id }, TestJWTKEY);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
}

export interface UserFilter {
  _id?: string,
  email?: string,
  name?: string,
  password?: string,
  admin?: boolean,
  pending?: boolean,
  permitted?: boolean,
  [key: string]: any,
}

export const User: IUserModel = model<IUser, IUserModel>('User', userSchema);

export default User;
