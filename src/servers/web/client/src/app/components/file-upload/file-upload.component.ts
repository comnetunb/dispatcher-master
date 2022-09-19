import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { FilesService } from '../../services/files.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FormArray, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { IFile } from '../../../../../../../database/models/file';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  @ViewChild('fileInput', null) FileInput: ElementRef;

  @Input() currentFiles: FormArray;
  @Input() single: boolean = false;

  get files(): IFile[] {
    let allFiles: IFile[] = [];
    if (this.currentFiles != null) {
      allFiles.push(...this.currentFiles.value.filter((e) => e.id != null));
    }
    return allFiles;
  }

  public readOnly: false;
  private loading: boolean = false;
  private loadingFiles: number = 0;

  get isLoading(): boolean {
    return this.loading;
  }

  constructor(
    private filesService: FilesService,
    private formBuilder: FormBuilder
  ) {
    if (this.currentFiles == null) {
      this.currentFiles = this.formBuilder.array([]);
    }
  }

  ngOnInit() {}

  success(event) {
    if (
      !(event.target && event.target.files) &&
      !(event.srcElement && event.srcElement.files) &&
      !(
        event.mouseEvent &&
        event.mouseEvent.dataTransfer &&
        event.mouseEvent.dataTransfer.files
      )
    ) {
      console.error('Unexpected event', event);
      return;
    }

    let files: File[] = [];
    this.currentFiles.clear();
    if (event.mouseEvent != undefined)
      files = event.mouseEvent.dataTransfer.files;
    else if (event.srcElement) files = event.srcElement.files;
    else files = event.target.files;

    if (this.single) {
      files = files.slice(0, 1);
    }

    for (let file of files) {
      let body = new FormData();
      this.loadingStartOccurrence();
      body.append('file', file);
      body.append('name', file.name);
      body.append('contentType', file.type);

      let fileForm = this.addEmptyFile();

      let request = this.filesService.upload(body).subscribe(
        (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            fileForm.controls['progress'].setValue(
              Math.round((100 * event.loaded) / event.total)
            );
          } else if (event instanceof HttpResponse) {
            fileForm.controls['id'].setValue(event.body._id);
            fileForm.controls['name'].setValue(event.body.name);
            fileForm.controls['finished'].setValue(true);
            this.loadingFinishOcurrence();
          }
        },
        (err) => {
          console.error(err);
          this.loadingFinishOcurrence();
        }
      );

      fileForm.controls['request'].setValue(request);
    }
  }

  private addEmptyFile(): FormGroup {
    let file = this.formBuilder.group({
      id: ['', Validators.required],
      name: ['', Validators.required],

      request: [null],
      progress: [''],
      finished: [false],
    });

    this.currentFiles.push(file);
    return file;
  }

  clickFileInput() {
    this.FileInput.nativeElement.click();
  }

  delete(file: IFile) {
    var index = this.currentFiles.value.findIndex((f) => f.id == file.id);
    if (index > -1) {
      this.currentFiles.removeAt(index);
    }
  }

  private loadingStartOccurrence(): void {
    this.loadingFiles++;
    this.loading = true;
  }

  private loadingFinishOcurrence(): void {
    this.loadingFiles--;
    if (this.loadingFiles == 0) this.loading = false;
  }
}
