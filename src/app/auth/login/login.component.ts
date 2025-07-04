// features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService,private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    // if (this.loginForm.invalid) return;
    this.router.navigate(['/dashboard']);

    // const { email, password } = this.loginForm.value;
    // this.authService.login(email, password).subscribe({
    //   next: (res) => console.log('Logged in', res),
    //   error: (err) => this.errorMessage = 'Login failed. Please try again.'
    // });
  }
}
