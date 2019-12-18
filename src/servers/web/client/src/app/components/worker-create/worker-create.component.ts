import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { RegisterUserRequest } from '../../api/register-user-request';
import { getErrorMessage } from '../../classes/utils';
import { WorkerCreateRequest } from '../../api/worker-create-request';
import { WorkerService } from '../../services/worker.service';

@Component({
  selector: 'app-worker-create',
  templateUrl: './worker-create.component.html',
  styleUrls: ['./worker-create.component.scss']
})
export class WorkerCreateComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private workerService: WorkerService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      password: ['', Validators.required],
      description: [''],
      cpuLimit: ['', [Validators.min(0), Validators.max(1)]],
      memoryLimit: ['', [Validators.min(0), Validators.max(1)]],
    });

    this.form.addControl('confirmPassword',
      new FormControl('', [Validators.required, this.validateAreEqual.bind(this)])
    );
  }

  private validateAreEqual(fieldControl: FormControl): { notEqual: boolean } {
    return fieldControl.value === this.form.get("password").value ? null : {
      notEqual: true
    };
  }

  submit() {
    if (!this.form.valid) {
      return;
    }

    let formValue = this.form.value;

    if (formValue.confirmPassword != formValue.password) {
      return;
    }

    this.loading = true;

    const request: WorkerCreateRequest = {
      name: formValue.name,
      password: formValue.password,
      description: formValue.description,
      cpuLimit: formValue.cpuLimit,
      memoryLimit: formValue.memoryLimit,
    };

    this.workerService.create(request)
      .subscribe(() => { this.loading = false; },
        (error) => {
          this.loading = false;
          this.errorMessage = getErrorMessage(error);
        });
  }

  getErrorMessage(formControlName: string) {
    let formControl = this.form.get(formControlName);

    switch (formControlName) {
      case 'name':
        return formControl.hasError('required') ? 'Fill the name' :
          '';

      case 'password':
        return formControl.hasError('required') ? 'Password is required' :
          '';

      case 'confirmPassword':
        return formControl.hasError('required') ? 'Confirm your password' :
          formControl.hasError('notEqual') ? 'Passwords do not match' :
            '';

      case 'cpuLimit':
        return formControl.hasError('min') ? 'The minimum is 0' :
          formControl.hasError('max') ? 'The maximum is 1' :
            '';

      case 'memoryLimit':
        return formControl.hasError('min') ? 'The minimum is 0' :
          formControl.hasError('max') ? 'The maximum is 1' :
            '';
    }

    return 'Invalid field'; // should not happen
  }

}
