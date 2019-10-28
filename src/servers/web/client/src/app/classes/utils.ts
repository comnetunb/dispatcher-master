export function getErrorMessage(err: any): string {
  if (typeof err.error.error == 'string') return err.error.error;
  else return err.error.error.message;
}
