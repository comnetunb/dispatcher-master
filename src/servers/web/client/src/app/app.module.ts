import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatMenuModule,
  MatIconModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSidenavModule,
  MatProgressBarModule,
  MatToolbarModule,
  MatDividerModule,
  MatSelectModule,
  MatListModule,
  MatDialogModule,
} from '@angular/material';
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
import { DialogAlertComponent } from './components/dialog-alert/dialog-alert.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { DialogConfirmComponent } from './components/dialog-confirm/dialog-confirm.component';
import { UsersComponent } from './components/users/users.component';
import { DialogNotificationsComponent } from './components/dialog-notifications/dialog-notifications.component';
import { TasksetGraphsComponent } from './components/taskset-graphs/taskset-graphs.component';
import { DialogService } from './services/dialog.service';
import { GraphComponent } from './components/graph/graph.component';
import {
  CommonModule,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { ChartsModule } from 'ng2-charts';
import { SettingsComponent } from './components/settings/settings.component';
import { AdminModeInterceptor } from './interceptors/admin-mode.interceptor';
import { AdminWorkersComponent } from './components/admin-workers/admin-workers.component';
import { WorkerListComponent } from './components/worker-list/worker-list.component';
import { WorkerCreateComponent } from './components/worker-create/worker-create.component';
import { WorkerStatusPipe } from './pipes/worker-status.pipe';
import { DialogConfigFileComponent } from './components/dialog-config-file/dialog-config-file.component';
import { WorkerEditComponent } from './components/worker-edit/worker-edit.component';
import { TasksetEditComponent } from './components/taskset-edit/taskset-edit.component';
import { PriorityPipe } from './pipes/priority.pipe';
import { DialogOverviewComponent } from './components/dialog-overview/dialog-overview.component';

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
    SettingsComponent,
    AdminWorkersComponent,
    WorkerListComponent,
    WorkerCreateComponent,
    WorkerStatusPipe,
    DialogConfigFileComponent,
    DialogOverviewComponent,
    WorkerEditComponent,
    TasksetEditComponent,
    PriorityPipe,
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
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AdminModeInterceptor,
      multi: true,
    },
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
    DialogService,
  ],
  entryComponents: [
    DialogAlertComponent,
    DialogConfirmComponent,
    DialogNotificationsComponent,
    DialogConfigFileComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
