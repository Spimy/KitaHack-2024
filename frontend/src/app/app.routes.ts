import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
];
