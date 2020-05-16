import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
import { TasksetService } from "../../services/taskset.service";
import {
  Modifier,
  InputType,
  TaskSetPriority,
} from "../../../../../../../api/enums";
import { IFile } from "../../../../../../../database/models/file";
import { FilesService } from "../../services/files.service";
import { ReplaySubject, Subject } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { MatSelect } from "@angular/material";
import { CreateTasksetRequest } from "../../../../../api/create-taskset-request";
import { IInput } from "../../../../../../../database/models/taskSet";
import { Router, ActivatedRoute } from "@angular/router";
import { getErrorMessage } from "src/app/classes/utils";

@Component({
  selector: "app-taskset-create",
  templateUrl: "./taskset-create.component.html",
  styleUrls: ["./taskset-create.component.scss"],
})
export class TasksetCreateComponent implements OnInit, OnDestroy {
  Modifier: Modifier;
  form: FormGroup;
  inputs: FormArray;
  inputTypes: InputType[];
  loading = false;
  files: IFile[];
  errorMessage: string;

  /** control for the MatSelect filter keyword */
  public fileFilterCtrl: FormControl = new FormControl();

  /** list of files filtered by search keyword */
  public filteredFiles: ReplaySubject<IFile[]> = new ReplaySubject<IFile[]>(1);

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  @ViewChild("runnableSelect", { static: true }) runnableSelect: MatSelect;

  constructor(
    private fb: FormBuilder,
    private tasksetService: TasksetService,
    private fileService: FilesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.inputs = this.fb.array([]);
    this.inputTypes = [];
    this.form = this.fb.group({
      name: ["", Validators.required],
      description: [""],
      errorCountLimit: ["5", Validators.required],
      runnable: ["", Validators.required],
      runnableType: ["", Validators.required],
      template: ["", Validators.required],
      priority: [TaskSetPriority.Normal, Validators.required],
      inputs: this.inputs,
    });

    this.fileService.list().subscribe((f) => {
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

    let tasksetId = this.route.snapshot.queryParams["tasksetId"];
    if (tasksetId != null) {
      this.loading = true;
      this.tasksetService.get(tasksetId).subscribe((ts) => {
        let value = {
          name: ts.name,
          errorCountLimit: ts.errorLimitCount,
          description: ts.description,
          runnable: ts._runnable,
          runnableType: ts._runnableType,
          template: ts.argumentTemplate,
          priority: ts.priority,
          inputs: [],
        };
        this.form.setValue(value);
        for (let input of ts.inputs) {
          this.inputs.push(
            this.fb.group({
              index: [input.index, Validators.required],
              priority: [input.priority, Validators.required],
              type: [input.type, Validators.required],
              input: [input.input, Validators.required],
              label: [input.label, Validators.required],
            })
          );
          this.inputTypes.push(input.type);
        }
        this.loading = false;
      });
    }
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

    let inputs: IInput[] = [];
    for (let input of this.inputs.value) {
      inputs.push({
        index: parseInt(input.index),
        priority: parseInt(input.priority),
        type: input.type,
        input: input.input,
        label: input.label,
      });
    }

    let request: CreateTasksetRequest = {
      name: formValue.name,
      description: formValue.description,
      errorCountLimit: formValue.errorCountLimit,
      runnableId: formValue.runnable,
      runnableType: formValue.runnableType,
      template: formValue.template,
      priority: formValue.priority,
      inputs: inputs,
    };

    this.loading = true;
    this.tasksetService.create(request).subscribe(
      (ts) => {
        this.loading = false;
        this.router.navigate(["..", ts._id], { relativeTo: this.route });
      },
      (error) => {
        this.loading = false;
        this.errorMessage = getErrorMessage(error);
        console.error(error);
      }
    );
  }

  getErrorMessage(formControlName: string, inputIndex?: number) {
    let formControl = this.form.get(formControlName);
    if (inputIndex != null) {
      formControl = this.inputs.at(inputIndex).get(formControlName);
    }

    switch (formControlName) {
      case "name":
        return formControl.hasError("required") ? "Name is required" : "";

      case "errorCountLimit":
        return formControl.hasError("required")
          ? "Error count limit is required"
          : "";

      case "runnable":
        return formControl.hasError("required") ? "Runnable is required" : "";

      case "runnableType":
        return formControl.hasError("required")
          ? "Runnable type is required"
          : "";

      case "template":
        return formControl.hasError("required")
          ? "Command template is required"
          : "";

      case "index":
        return formControl.hasError("required") ? "Index is required" : "";

      case "priority":
        return formControl.hasError("required") ? "Priority is required" : "";

      case "label":
        return formControl.hasError("required") ? "Label is required" : "";

      case "type":
        return formControl.hasError("required") ? "Input type is required" : "";

      case "input":
        return formControl.hasError("required") ? "Input is required" : "";
    }

    return "Invalid field"; // should not happen
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
        this.runnableSelect.compareWith = (a: IFile, b: IFile) =>
          a && b && a._id === b._id;
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
      this.files.filter((file) => file.name.toLowerCase().indexOf(search) > -1)
    );
  }

  public addInput() {
    let usedIndexes = {};
    for (let input of this.inputs.value) {
      usedIndexes[input.index] = 1;
    }
    let curIndex = 0;
    while (usedIndexes[curIndex] == 1) curIndex++;

    let input = this.fb.group({
      index: [curIndex, Validators.required],
      priority: [curIndex, Validators.required],
      type: ["", Validators.required],
      input: ["", Validators.required],
      label: ["", Validators.required],
    });

    this.inputs.insert(curIndex, input);
    this.inputTypes.splice(curIndex, 0, InputType.CommaSeparatedValues);

    input.get("type").valueChanges.subscribe((t) => {
      this.inputTypes[curIndex] = t;
    });
  }

  public removeInput(index: number) {
    this.inputs.removeAt(index);
    this.inputTypes.splice(index, 1);
  }
}
