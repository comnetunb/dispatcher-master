export interface WorkerCreateRequest {
  name: string,
  password: string,
  description: string,
  cpuLimit: number,
  memoryLimit: number,
}
