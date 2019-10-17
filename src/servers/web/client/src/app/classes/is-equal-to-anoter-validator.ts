import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

export function isEqualToAnother(form: FormGroup, otherKey: string) {
  return (fieldControl: FormControl): { notEqual: boolean } => {
    return fieldControl.value === form.get(otherKey).value ? null : {
      notEqual: true
    };
  }
}
