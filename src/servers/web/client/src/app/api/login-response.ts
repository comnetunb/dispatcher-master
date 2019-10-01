import { IUser } from '../../../../../../database/models/user';

export interface LoginResponse {
  token: string;
  user: IUser;
}
