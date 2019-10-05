import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TasksetService } from 'src/app/services/taskset.service';

@Component({
  selector: 'app-taskset-create',
  templateUrl: './taskset-create.component.html',
  styleUrls: ['./taskset-create.component.scss']
})
export class TasksetCreateComponent implements OnInit {

  form: FormGroup;
  loading = false;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private tasksetService: TasksetService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      errorCountLimit: ['5', Validators.required],
    });
  }

  submit() {
    if (!this.form.valid) {
      return;
    }

    let formValue = this.form.value;

    this.loading = true;
  }

  getErrorMessage(formControlName: string) {
    let formControl = this.form.get(formControlName);
    switch (formControlName) {
      case 'email':
        return formControl.hasError('required') ? 'E-mail is required' :
          formControl.hasError('email') ? 'Invalid e-mail' :
            '';

      case 'password':
        return formControl.hasError('required') ? 'Password is required' :
          '';
    }

    return 'Invalid field'; // should not happen
  }
}
