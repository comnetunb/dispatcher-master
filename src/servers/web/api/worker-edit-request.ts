export interface WorkerEditRequest {
  name: string,
  description: string,
  newPassword: string,
  cpuLimit: number,
  memoryLimit: number,
}
