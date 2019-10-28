import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { getErrorMessage } from 'src/app/classes/utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  loading = false;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit() {
    if (!this.form.valid) {
      return;
    }

    let formValue = this.form.value;

    this.loading = true;

    this.authService.login(formValue.email, formValue.password)
      .subscribe(() => { },
        (error) => {
          this.errorMessage = getErrorMessage(error);
        });
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
