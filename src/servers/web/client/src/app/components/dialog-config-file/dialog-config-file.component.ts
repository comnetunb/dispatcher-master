import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogConfigFileData } from '../../../../../api/dialog-data';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dialog-config-file',
  templateUrl: './dialog-config-file.component.html',
  styleUrls: ['./dialog-config-file.component.scss'],
})
export class DialogConfigFileComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage: string;

  serverHostname: string;
  serverPort: number;
  workerId: string;
  workerPassword: string;

  constructor(
    public dialogRef: MatDialogRef<DialogConfigFileComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogConfigFileData
  ) {
    this.serverPort = data.workerApiPort;
    this.workerId = data.workerId;
  }

  ngOnInit() {
    this.form = this.fb.group({
      serverHostname: ['', [Validators.required]],
      serverPort: [this.serverPort, [Validators.required]],
      workerId: [this.workerId, Validators.required],
      workerPassword: ['', Validators.required],
    });
  }

  submit() {
    if (!this.form.valid) {
      return;
    }

    const formValue = this.form.value;

    const configJson = {
      dispatcherAddress: formValue.serverHostname,
      dispatcherPort: formValue.serverPort,
      workerId: formValue.workerId,
      workerPassword: formValue.workerPassword,
    };

    const file = new File([JSON.stringify(configJson)], 'config.json', {
      type: 'application/json',
    });
    saveAs(file);
  }

  getErrorMessage(formControlName: string) {
    const formControl = this.form.get(formControlName);
    switch (formControlName) {
      case 'serverHostname':
        return formControl.hasError('required') ? 'Hostname is required' : '';

      case 'serverPort':
        return formControl.hasError('required') ? 'Port is required' : '';

      case 'workerId':
        return formControl.hasError('required') ? 'Worker Id is required' : '';

      case 'workerPassword':
        return formControl.hasError('required')
          ? 'Worker password is required'
          : '';
    }

    return 'Invalid field'; // should not happen
  }
}
