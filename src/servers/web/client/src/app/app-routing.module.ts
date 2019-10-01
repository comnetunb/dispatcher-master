import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FrontPageComponent } from './components/front-page/front-page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { WelcomeNewUserComponent } from './components/welcome-new-user/welcome-new-user.component';
import { AllowedGuard } from './guards/allowed.guard';
import { AuthGuard } from './guards/auth.guard';


const routes: Routes = [];

const appRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: FrontPageComponent, pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'welcome', component: WelcomeNewUserComponent },
      {
        path: 'dashboard', canActivate: [AuthGuard, AllowedGuard], children: [

        ]
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
