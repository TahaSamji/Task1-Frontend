// features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports :[  CommonModule,
    ReactiveFormsModule,  // ✅ This fixes the "Can't bind to formGroup" error
    RouterModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.authService.setToken(res.token);
        // localStorage.setItem('token', res.token); // ✅ Save JWT
        this.router.navigate(['/dashboard']);      // ✅ Navigate to dashboard
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Login failed. Please try again.';
      }
    });
  }
}
