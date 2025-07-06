import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { UploadComponent } from './features/dashboard/components/upload/main';
import { AuthGuard } from './core/authguard/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent }
    ]
  },
  { path: 'dashboard', component: UploadComponent,canActivate : [AuthGuard] },
  { path: '**', redirectTo: 'auth/login' }
];
