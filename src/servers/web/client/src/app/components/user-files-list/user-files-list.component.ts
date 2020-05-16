import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchService, LacunaMaterialTableComponent } from 'lacuna-mat-table';
import { FilesService } from 'src/app/services/files.service';
import { IFile } from '../../../../../../../database/models/file';
import { saveAs } from 'file-saver';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-user-files-list',
  templateUrl: './user-files-list.component.html',
  styleUrls: ['./user-files-list.component.scss'],
})
export class UserFilesListComponent implements OnInit {
  columnsToDisplay$: string[] = ['name', 'size', 'uploadTime', 'delete'];
  dataSource: SearchService<IFile>;
  customTitle = 'Files';

  @ViewChild(LacunaMaterialTableComponent, { static: false })
  lacTable: LacunaMaterialTableComponent<IFile>;

  constructor(
    private filesService: FilesService,
    private dialogService: DialogService
  ) {
    this.lacTable.searchLabel = 'Search';
  }

  ngOnInit() {
    this.dataSource = this.filesService;
  }

  delete(file: IFile) {
    this.filesService.delete(file._id).subscribe(
      () => {
        this.lacTable.refresh();
      },
      (err) => {
        console.error(err);
        this.dialogService.alert(err, `Could not delete ${file.name}`);
      }
    );
  }

  download(file: IFile) {
    this.filesService.get(file._id).subscribe(
      (data) => {
        const ff = new File([data], file.name, { type: file.mimetype });
        saveAs(ff);
      },
      (err) => {
        console.error(err);
        this.dialogService.alert(err, `Could not download ${file.name}`);
      }
    );
  }
}
