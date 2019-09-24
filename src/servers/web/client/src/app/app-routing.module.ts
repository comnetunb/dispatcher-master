import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FrontPageComponent } from './components/front-page/front-page.component';
import { LoginComponent } from './components/login/login.component';


const routes: Routes = [];

const appRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: FrontPageComponent, pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
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
