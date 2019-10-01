import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule, MatCheckboxModule, MatMenuModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSidenavModule } from '@angular/material';
import { LoginComponent } from './components/login/login.component';
import { FrontPageComponent } from './components/front-page/front-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './components/register/register.component';
import { WelcomeNewUserComponent } from './components/welcome-new-user/welcome-new-user.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    FrontPageComponent,
    RegisterComponent,
    WelcomeNewUserComponent,
    DashboardComponent,
  ],
  imports: [
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
