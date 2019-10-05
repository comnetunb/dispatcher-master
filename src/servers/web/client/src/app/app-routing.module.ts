import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FrontPageComponent } from './components/front-page/front-page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { WelcomeNewUserComponent } from './components/welcome-new-user/welcome-new-user.component';
import { AllowedGuard } from './guards/allowed.guard';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WorkersComponent } from './components/workers/workers.component';
import { LogsComponent } from './components/logs/logs.component';
import { OperationState } from '../../../../../api/enums';
import { TasksetsComponent } from './components/tasksets/tasksets.component';
import { TasksetCreateComponent } from './components/taskset-create/taskset-create.component';

const routes: Routes = [];

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: FrontPageComponent,
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'welcome',
        component: WelcomeNewUserComponent
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard, AllowedGuard],
        component: DashboardComponent,
        children: [
          {
            path: 'workers',
            component: WorkersComponent,
          },
          {
            path: 'logs',
            component: LogsComponent,
          },
          {
            path: 'tasksets',
            children: [
              {
                path: '',
                component: TasksetsComponent,
                pathMatch: 'full',
              },
              {
                path: 'create',
                component: TasksetCreateComponent,
              },
              {
                path: 'executing',
                data: { tasksetState: OperationState.Executing },
                component: TasksetsComponent,
              },
              {
                path: 'finished',
                data: { tasksetState: OperationState.Finished },
                component: TasksetsComponent,
              },
              {
                path: 'canceled',
                data: { tasksetState: OperationState.Canceled },
                component: TasksetsComponent,
              },
            ],
          },
        ]
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
