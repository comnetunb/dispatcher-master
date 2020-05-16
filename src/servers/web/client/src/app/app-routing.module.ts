import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FrontPageComponent } from "./components/front-page/front-page.component";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { WelcomeNewUserComponent } from "./components/welcome-new-user/welcome-new-user.component";
import { AllowedGuard } from "./guards/allowed.guard";
import { AuthGuard } from "./guards/auth.guard";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { WorkersComponent } from "./components/workers/workers.component";
import { LogsComponent } from "./components/logs/logs.component";
import { TasksetsComponent } from "./components/tasksets/tasksets.component";
import { TasksetCreateComponent } from "./components/taskset-create/taskset-create.component";
import { ProfileDetailsComponent } from "./components/profile-details/profile-details.component";
import { ProfileEditComponent } from "./components/profile-edit/profile-edit.component";
import { UploadFilesUserComponent } from "./components/upload-files-user/upload-files-user.component";
import { UserFilesComponent } from "./components/user-files/user-files.component";
import { TasksetDetailsComponent } from "./components/taskset-details/taskset-details.component";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { UsersComponent } from "./components/users/users.component";
import { TasksetGraphsComponent } from "./components/taskset-graphs/taskset-graphs.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { AdminWorkersComponent } from "./components/admin-workers/admin-workers.component";
import { WorkerCreateComponent } from "./components/worker-create/worker-create.component";
import { WorkerEditComponent } from "./components/worker-edit/worker-edit.component";
import { TasksetEditComponent } from "./components/taskset-edit/taskset-edit.component";

const routes: Routes = [];

const appRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: FrontPageComponent,
        pathMatch: "full",
      },
      {
        path: "login",
        component: LoginComponent,
      },
      {
        path: "register",
        component: RegisterComponent,
      },
      {
        path: "admin",
        component: AdminDashboardComponent,
        children: [
          {
            path: "users",
            component: UsersComponent,
          },
          {
            path: "workers",
            component: AdminWorkersComponent,
            children: [
              {
                path: "new",
                component: WorkerCreateComponent,
              },
              {
                path: ":id",
                component: WorkerEditComponent,
              },
            ],
          },
          {
            path: "settings",
            component: SettingsComponent,
          },
          {
            path: "logs",
            component: LogsComponent,
          },
        ],
      },
      {
        path: "welcome",
        component: WelcomeNewUserComponent,
      },
      {
        path: "profile",
        children: [
          {
            path: "",
            pathMatch: "full",
            component: ProfileDetailsComponent,
          },
          {
            path: "edit",
            component: ProfileEditComponent,
          },
        ],
      },
      {
        path: "dashboard",
        canActivate: [AuthGuard, AllowedGuard],
        component: DashboardComponent,
        children: [
          {
            path: "workers",
            component: WorkersComponent,
          },
          {
            path: "files",
            component: UserFilesComponent,
          },
          {
            path: "upload",
            component: UploadFilesUserComponent,
          },
          {
            path: "tasksets",
            children: [
              {
                path: "",
                component: TasksetsComponent,
                pathMatch: "full",
              },
              {
                path: "create",
                component: TasksetCreateComponent,
              },
              {
                path: ":tasksetId",
                component: TasksetDetailsComponent,
                children: [
                  {
                    path: "graphs",
                    component: TasksetGraphsComponent,
                  },
                  {
                    path: "edit",
                    component: TasksetEditComponent,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
