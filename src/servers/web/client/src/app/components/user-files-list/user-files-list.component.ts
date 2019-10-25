import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchService, LacunaMaterialTableComponent } from 'lacuna-mat-table';
import { FilesService } from 'src/app/services/files.service';
import { IFile } from '../../../../../../../database/models/file';

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
}
