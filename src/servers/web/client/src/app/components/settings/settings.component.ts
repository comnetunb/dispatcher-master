import { Component, OnInit } from '@angular/core';
import { IConfiguration } from '../../../../../../../database/models/configuration';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { isEqualToAnother } from '../../classes/is-equal-to-anoter-validator';
import { EditUserRequest } from '../../api/edit-user-request';
import { getErrorMessage } from '../../classes/utils';
import { SettingsService } from '../../services/settings.service';
import { DialogService } from '../../services/dialog.service';
import { EditSettingsRequest } from '../../api/edit-settings-request';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  settings: IConfiguration;
  form: FormGroup;
  loading = false;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      cpuLimit: ['', Validators.required],
      memoryLimit: ['', Validators.required],
      requestResourceInterval: ['', Validators.required],
      dispatchInterval: ['', Validators.required],
      emailService: [''],
      emailUser: [''],
      emailPassword: [''],
    });

    this.settingsService.get().subscribe(settings => {
      this.settings = settings;
      this.form.setValue({
        cpuLimit: settings.cpuLimit,
        memoryLimit: settings.memoryLimit,
        requestResourceInterval: settings.requestResourceInterval,
        dispatchInterval: settings.dispatchInterval,
        emailService: settings.emailService || null,
        emailUser: settings.emailUser || null,
        emailPassword: settings.emailPassword || null,
      });
    })
  }

  submit() {
    if (!this.form.valid) {
      return;
    }

    let formValue = this.form.value;
    this.settings.cpuLimit = formValue.cpuLimit;
    this.settings.memoryLimit = formValue.memoryLimit;
    this.settings.requestResourceInterval = formValue.requestResourceInterval;
    this.settings.dispatchInterval = formValue.dispatchInterval;
    this.settings.emailService = formValue.emailService;
    this.settings.emailUser = formValue.emailUser;
    this.settings.emailPassword = formValue.emailPassword;

    let request: EditSettingsRequest = {
      cpuLimit: formValue.cpuLimit,
      memoryLimit: formValue.memoryLimit,
      requestResourceInterval: formValue.requestResourceInterval,
      dispatchInterval: formValue.dispatchInterval,
      emailService: formValue.emailService,
      emailUser: formValue.emailUser,
      emailPassword: formValue.emailPassword,
    }

    this.loading = true;

    this.settingsService.set(request)
      .subscribe(() => {
        this.loading = false;
        this.dialogService.alert('Settings updated!', 'Success!');
      },
        (error) => {
          this.dialogService.alert(getErrorMessage(error), 'Error');
        });
  }

  getErrorMessage(formControlName: string) {
    let formControl = this.form.get(formControlName);

    switch (formControlName) {
      case 'cpuLimit':
        return formControl.hasError('required') ? 'CPU Limit is required' :
          '';

      case 'memoryLimit':
        return formControl.hasError('required') ? 'Memory limit is required' :
          '';

      case 'requestResourceInterval':
        return formControl.hasError('required') ? 'Request resource interval is required' :
          '';

      case 'dispatchInterval':
        return formControl.hasError('required') ? 'Dispatch interval is required' :
          '';
    }

    return 'Invalid field'; // should not happen
  }


}
