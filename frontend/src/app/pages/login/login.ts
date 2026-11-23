
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // USER LOGIN
  login(): void {

    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    const credentials = {
      email: this.email.trim(),
      password: this.password
    };

    this.authService.login(credentials).subscribe({

      next: (res: any) => {

        // Save the user's email
        localStorage.setItem('taskflow_user', credentials.email);

        // Extract user details from common API response structures
        const user =
          res?.user ||
          res?.data?.user ||
          res?.data ||
          null;

        // Save user details if the backend returns them
        if (user) {
          localStorage.setItem(
            'taskflow_user_details',
            JSON.stringify(user)
          );
        }

        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      },

      error: (err) => {

        console.error('Login failed:', err);

        this.errorMessage =
          err.error?.message || 'Invalid email or password.';
      }

    });
  }

  // FORGOT PASSWORD
  forgotPassword(event: Event): void {

    event.preventDefault();

    this.errorMessage = 'Password recovery will be available soon.';
  }

  // GOOGLE LOGIN
  googleLogin(): void {

    this.errorMessage = 'Google login will be connected later.';
  }

  // CREATE ACCOUNT / REGISTER
  createAccount(event: Event): void {

    event.preventDefault();

    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {

      this.errorMessage =
        'Enter your email and password above, then click Create account.';

      return;
    }

    const derivedName =
      this.email
        .trim()
        .split('@')[0]
        .replace(/[^a-zA-Z ]/g, '') || 'User';

    const userData = {
      name: derivedName,
      email: this.email.trim(),
      password: this.password
    };

    this.authService.register(userData).subscribe({

      next: () => {

        // Registration successful; log in with the new account
        this.login();
      },

      error: (err) => {

        console.error('Registration failed:', err);

        this.errorMessage =
          err.error?.message || 'Registration failed.';
      }

    });
  }
}
