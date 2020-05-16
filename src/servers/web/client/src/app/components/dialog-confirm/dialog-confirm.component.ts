import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DialogAlertComponent } from "../dialog-alert/dialog-alert.component";
import { DialogData } from "../../../../../api/dialog-data";

@Component({
  selector: "app-dialog-confirm",
  templateUrl: "./dialog-confirm.component.html",
  styleUrls: ["./dialog-confirm.component.scss"],
})
export class DialogConfirmComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.title == null) {
      data.title = "Confirm?";
    }
  }

  ngOnInit() {}
}
