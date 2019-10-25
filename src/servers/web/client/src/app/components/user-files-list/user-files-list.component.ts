import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchService, LacunaMaterialTableComponent } from 'lacuna-mat-table';
import { FilesService } from 'src/app/services/files.service';
import { IFile } from '../../../../../../../database/models/file';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-user-files-list',
  templateUrl: './user-files-list.component.html',
  styleUrls: ['./user-files-list.component.scss']
})
export class UserFilesListComponent implements OnInit {
  columnsToDisplay$: string[] = ['name', 'size', 'uploadTime', 'delete'];
  dataSource: SearchService<IFile>;
  customTitle: string = "Arquivos";

  @ViewChild(LacunaMaterialTableComponent, { static: false }) lacTable: LacunaMaterialTableComponent<IFile>;

  constructor(
    private filesService: FilesService
  ) { }

  ngOnInit() {
    this.dataSource = this.filesService;
  }

  delete(file: IFile) {
    this.filesService.delete(file._id).subscribe(() => {
      this.lacTable.refresh();
    }, err => {
      console.error(err);
    });
  }

  download(file: IFile) {
    this.filesService.get(file._id).subscribe(data => {
      var blob = new Blob([data], { type: file.mimetype });
      var url = window.URL.createObjectURL(blob);
      saveAs(blob, file.name);
      window.open(url);
    }, err => {
      console.error(err);
    });
  }
}
