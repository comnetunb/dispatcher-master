import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { TasksetService } from 'src/app/services/taskset.service';
import { Modifier } from '../../../../../../../api/enums';
import { IFile } from '../../../../../../../database/models/file';
import { FilesService } from 'src/app/services/files.service';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material';

@Component({
  selector: 'app-taskset-create',
  templateUrl: './taskset-create.component.html',
  styleUrls: ['./taskset-create.component.scss']
})
export class TasksetCreateComponent implements OnInit, OnDestroy {
  Modifier: Modifier;
  form: FormGroup;
  runnable: FormArray;
  inputs: FormArray;
  loading = false;
  files: IFile[];
  errorMessage: string;

  /** control for the MatSelect filter keyword */
  public fileFilterCtrl: FormControl = new FormControl();

  /** list of files filtered by search keyword */
  public filteredFiles: ReplaySubject<IFile[]> = new ReplaySubject<IFile[]>(1);

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  @ViewChild('runnableSelect', { static: true }) runnableSelect: MatSelect;

  constructor(
    private fb: FormBuilder,
    private tasksetService: TasksetService,
    private fileService: FilesService
  ) { }

  ngOnInit() {

    this.form = this.fb.group({
      name: ['', Validators.required],
      errorCountLimit: ['5', Validators.required],
      runnable: ['', Validators.required],
      template: ['', Validators.required],
      inputs: this.inputs,
    });

    this.fileService.getFiles().subscribe(f => {
      this.files = f;

      // load the initial file list
      this.filteredFiles.next(this.files.slice());

      // listen for search field value changes
      this.fileFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterFiles();
        });
    });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
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


  /**
   * Sets the initial value after the filteredFiles are loaded initially
   */
  protected setInitialValue() {
    this.filteredFiles
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredFiles are loaded initially
        // and after the mat-option elements are available
        this.runnableSelect.compareWith = (a: IFile, b: IFile) => a && b && a._id === b._id;
      });
  }


  protected filterFiles() {
    if (!this.files) {
      return;
    }
    // get the search keyword
    let search = this.fileFilterCtrl.value;
    if (!search) {
      this.filteredFiles.next(this.files.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the files
    this.filteredFiles.next(
      this.files.filter(file => file.name.toLowerCase().indexOf(search) > -1)
    );
  }

}
