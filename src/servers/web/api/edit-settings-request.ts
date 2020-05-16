export interface EditSettingsRequest {
  cpuLimit: number,
  memoryLimit: number,
  requestResourceInterval: number,
  dispatchInterval: number,
  emailService?: string,
  emailUser?: string,
  emailPassword?: string,
}
