import { IInput } from "../../../database/models/taskSet";
import { TaskSetPriority } from "../../../api/enums";

export interface CreateTasksetRequest {
  name: string;
  description: string;
  errorCountLimit: number;
  runnableId: string;
  runnableType: string;
  template: string;
  priority: TaskSetPriority;
  inputs: IInput[];
}

export interface EditTasksetRequest {
  name: string;
  description: string;
  errorCountLimit: number;
  runnableId: string;
  runnableType: string;
  template: string;
  priority: TaskSetPriority;
  inputs: IInput[];
}
