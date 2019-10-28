import { IInput } from '../../../../../../database/models/taskSet';

export interface CreateTasksetRequest {
  name: string;
  description: string;
  errorCountLimit: number;
  runnableId: string;
  runnableType: string;
  template: string;
  inputs: IInput[];
}
