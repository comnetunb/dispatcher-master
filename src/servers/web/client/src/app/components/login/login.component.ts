import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

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
      .subscribe((teste) => {
        console.log(teste);
      },
        (error) => {
          console.log(error);
          this.errorMessage = error.error.error;
        });
  }

  getErrorMessage(formControlName: string) {
    let formControl = this.form.get(formControlName);
    switch (formControlName) {
      case 'email':
        return formControl.hasError('required') ? 'Preencha o e-mail' :
          formControl.hasError('email') ? 'E-mail inválido' :
            '';

      case 'password':
        return formControl.hasError('required') ? 'Preencha a senha' :
          '';
    }

    return 'Campo inválido'; // should not happen
  }

}
