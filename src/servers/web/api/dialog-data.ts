import { INotification } from "../../../database/models/notification";

export interface DialogData {
  title?: string;
  message: string;
}

export interface DialogNotificationsData {
  notifications: INotification[];
}

export interface DialogConfigFileData {
  workerId: string;
}
