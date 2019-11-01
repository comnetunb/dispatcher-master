export function getErrorMessage(err: any): string {
  if (err && err.error && err.error.error && typeof err.error.error == 'string') return err.error.error;
  else if (err && err.error && err.error.error && err.error.error.message) return err.error.error.message;
  else if (err && err.error) return err.error;
}
