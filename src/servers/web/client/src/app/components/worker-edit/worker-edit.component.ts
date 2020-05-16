import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { Router, ActivatedRoute } from "@angular/router";
import { WorkerService } from "../../services/worker.service";
import { WorkerCreateRequest } from "../../../../../api/worker-create-request";
import { getErrorMessage } from "../../classes/utils";
import { IWorker } from "../../../../../../../database/models/worker";
import { isEqualToAnother } from "../../classes/is-equal-to-anoter-validator";
import { WorkerEditRequest } from "../../../../../api/worker-edit-request";
import { DialogService } from "../../services/dialog.service";

@Component({
  selector: "app-worker-edit",
  templateUrl: "./worker-edit.component.html",
  styleUrls: ["./worker-edit.component.scss"],
})
export class WorkerEditComponent implements OnInit {
  worker: IWorker;
  form: FormGroup;
  loading = false;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private workerService: WorkerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ["", Validators.required],
      password: [""],
      description: [""],
      cpuLimit: ["", [Validators.min(0), Validators.max(1)]],
      memoryLimit: ["", [Validators.min(0), Validators.max(1)]],
    });

    this.form.addControl(
      "confirmPassword",
      new FormControl("", [isEqualToAnother(this.form, "password")])
    );

    let workerId = this.route.snapshot.params["id"];

    this.workerService.get(workerId).subscribe((worker) => {
      this.worker = worker;
      this.form.setValue({
        name: worker.name,
        description: worker.description,
        password: null,
        confirmPassword: null,
        cpuLimit: worker.resourceLimit.cpu || null,
        memoryLimit: worker.resourceLimit.memory || null,
      });
    });
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

    const request: WorkerEditRequest = {
      name: formValue.name,
      newPassword: formValue.password,
      description: formValue.description,
      cpuLimit: formValue.cpuLimit,
      memoryLimit: formValue.memoryLimit,
    };

    this.workerService.edit(this.worker._id, request).subscribe(
      () => {
        this.loading = false;
        this.dialogService
          .alert(`Worker ${this.worker.name} has been edited!`)
          .subscribe((ok) => {
            this.router.navigate([".."], {
              relativeTo: this.route,
              queryParams: { refresh: true },
            });
          });
      },
      (error) => {
        this.loading = false;
        this.errorMessage = getErrorMessage(error);
      }
    );
  }

  getErrorMessage(formControlName: string) {
    let formControl = this.form.get(formControlName);

    switch (formControlName) {
      case "name":
        return formControl.hasError("required") ? "Fill the name" : "";

      case "password":
        return formControl.hasError("required") ? "Password is required" : "";

      case "confirmPassword":
        return formControl.hasError("required")
          ? "Confirm your password"
          : formControl.hasError("notEqual")
          ? "Passwords do not match"
          : "";

      case "cpuLimit":
        return formControl.hasError("min")
          ? "The minimum is 0"
          : formControl.hasError("max")
          ? "The maximum is 1"
          : "";

      case "memoryLimit":
        return formControl.hasError("min")
          ? "The minimum is 0"
          : formControl.hasError("max")
          ? "The maximum is 1"
          : "";
    }

    return "Invalid field"; // should not happen
  }
}
