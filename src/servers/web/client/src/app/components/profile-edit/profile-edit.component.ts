import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RegisterUserRequest } from '../../api/register-user-request';
import { isEqualToAnother } from '../../classes/is-equal-to-anoter-validator';
import { EditUserRequest } from '../../api/edit-user-request';
import { IUser } from '../../../../../../../database/models/user';
import { getErrorMessage } from 'src/app/classes/utils';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {

  user: IUser;
  form: FormGroup;
  loading = false;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required],
      newPassword: '',
    });

    this.form.addControl('confirmNewPassword',
      new FormControl('', [isEqualToAnother(this.form, 'newPassword')])
    );

    let userId = this.route.snapshot.params['id'];

    if (!userId) userId = this.authService.currentUserValue._id;

    this.userService.getUser(userId).subscribe((user) => {
      this.user = user;
      this.form.setValue({
        fullName: user.name,
        email: user.email,
        currentPassword: null,
        newPassword: null,
        confirmNewPassword: null,
      });
    });
  }

  submit() {
    if (!this.form.valid) {
      return;
    }

    let formValue = this.form.value;

    if (formValue.confirmNewPassword != formValue.newPassword) {
      return;
    }

    this.loading = true;

    const request: EditUserRequest = {
      email: formValue.email,
      name: formValue.fullName,
      password: formValue.currentPassword,
      newPassword: formValue.newPassword,
    };

    this.userService.editUser(this.user._id, request)
      .subscribe(() => {
        this.authService.refresh();
        this.router.navigate(['..'], { relativeTo: this.route });
      },
        (error) => {
          this.errorMessage = getErrorMessage(error);
        });
  }

  getErrorMessage(formControlName: string) {
    let formControl = this.form.get(formControlName);
    let formValue = this.form.value;

    switch (formControlName) {
      case 'fullName':
        return formControl.hasError('required') ? 'Fill your full name' :
          '';

      case 'email':
        return formControl.hasError('required') ? 'E-mail is required' :
          formControl.hasError('email') ? 'E-mail inválido' :
            '';

      case 'currentPassword':
        return formControl.hasError('required') ? 'Your current password is required' :
          '';

      case 'newPassword':
        return '';

      case 'confirmNewPassword':
        return formControl.hasError('required') ? 'Confirm your new password' :
          formControl.hasError('notEqual') ? 'Passwords do not match' :
            '';
    }

    return 'Invalid field'; // should not happen
  }



}
