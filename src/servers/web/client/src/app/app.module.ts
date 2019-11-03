import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatButtonModule, MatCheckboxModule, MatMenuModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSidenavModule, MatProgressBarModule, MatToolbarModule, MatTableModule, MatDividerModule, MatSelectModule, MatListModule, MatDialogModule } from '@angular/material';
import { LoginComponent } from './components/login/login.component';
import { FrontPageComponent } from './components/front-page/front-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './components/register/register.component';
import { WelcomeNewUserComponent } from './components/welcome-new-user/welcome-new-user.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WorkersComponent } from './components/workers/workers.component';
import { WorkerCardComponent } from './components/worker-card/worker-card.component';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { LacunaMaterialTableModule } from 'lacuna-mat-table';
import { LogLevelPipe } from './pipes/log-level.pipe';
import { LogListComponent } from './components/log-list/log-list.component';
import { LogsComponent } from './components/logs/logs.component';
import { TasksetListComponent } from './components/taskset-list/taskset-list.component';
import { TasksetsComponent } from './components/tasksets/tasksets.component';
import { TasksetCreateComponent } from './components/taskset-create/taskset-create.component';
import { ProfileDetailsComponent } from './components/profile-details/profile-details.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { UploadFilesUserComponent } from './components/upload-files-user/upload-files-user.component';
import { UserFilesComponent } from './components/user-files/user-files.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { UserFilesListComponent } from './components/user-files-list/user-files-list.component';
import { ReadableSizePipe } from './pipes/readable-size.pipe';
import { TasksetDetailsComponent } from './components/taskset-details/taskset-details.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { ResultPipePipe } from './pipes/result-pipe.pipe';
import { StatePipePipe } from './pipes/state-pipe.pipe';
import { NgxLoadingModule } from 'ngx-loading';
import { DialogOverviewComponent } from './components/dialog-overview/dialog-overview.component';
import { DialogAlertComponent } from './components/dialog-alert/dialog-alert.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { DialogConfirmComponent } from './components/dialog-confirm/dialog-confirm.component';
import { UsersComponent } from './components/users/users.component';
import { DialogNotificationsComponent } from './components/dialog-notifications/dialog-notifications.component';
import { TasksetGraphsComponent } from './components/taskset-graphs/taskset-graphs.component';
import { DialogService } from './services/dialog.service';
import { GraphComponent } from './components/graph/graph.component';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    FrontPageComponent,
    RegisterComponent,
    WelcomeNewUserComponent,
    DashboardComponent,
    WorkersComponent,
    WorkerCardComponent,
    LogListComponent,
    LogLevelPipe,
    LogsComponent,
    TasksetsComponent,
    TasksetListComponent,
    TasksetCreateComponent,
    ProfileDetailsComponent,
    ProfileEditComponent,
    FileUploadComponent,
    UploadFilesUserComponent,
    UserFilesComponent,
    UserFilesListComponent,
    ReadableSizePipe,
    TasksetDetailsComponent,
    TaskListComponent,
    ResultPipePipe,
    StatePipePipe,
    DialogAlertComponent,
    AdminDashboardComponent,
    UserListComponent,
    DialogConfirmComponent,
    UsersComponent,
    DialogNotificationsComponent,
    TasksetGraphsComponent,
    GraphComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatProgressBarModule,
    MatToolbarModule,
    LacunaMaterialTableModule,
    MatDividerModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatListModule,
    NgxLoadingModule,
    MatDialogModule,
    ChartsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    DialogService,
  ],
  entryComponents: [
    DialogAlertComponent,
    DialogConfirmComponent,
    DialogNotificationsComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
