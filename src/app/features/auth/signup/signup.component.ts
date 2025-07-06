// features/auth/signup/signup.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true, 
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterModule
  ]
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    const { name, email, password } = this.signupForm.value;
    this.authService.signup(name, email, password).subscribe({
      next: (res) => {
      
        this.router.navigate(['/auth/login']);      // ✅ Navigate after signup
      },
      error: () => {
        this.errorMessage = 'Signup failed. Please try again.';
      }
    });
  }
}
