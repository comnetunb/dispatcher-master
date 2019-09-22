import { model, Schema, Document } from 'mongoose';
import { hash, compareSync } from 'bcryptjs';

export interface IUser extends Document {
  email: string,
  name: string,
  password: string,
  admin: boolean,
  pending: boolean,
  permitted: boolean,
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

userSchema.statics.encryptPassword = (password, callback) => {
  hash(password, saltRounds, callback);
};

userSchema.methods.validPassword = function (password) { // eslint-disable-line func-names
  return compareSync(password, this.password);
};

export default model<IUser>('User', userSchema);
