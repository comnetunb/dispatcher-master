import { IRunnableInfo } from '../../../database/models/runnable_info';
import { InputType } from '../../../api/enums';

export interface InputFile {
  name: string,
  data: any,
}

export interface Input {
  precedence: number,
  directiveIndex: number,
  data: string | InputFile[],
  type: InputType,
}

export interface ParsedInput {
  data: string[] | number[] | InputFile[],
  directiveIndex: number,
}

export interface TaskSetData {
  name: string,
  runnableInfo: {
    info: IRunnableInfo,
    runnable: InputFile
  },
  inputs: Input[],
  argumentTemplate: string,
  errorLimit: number,
}
