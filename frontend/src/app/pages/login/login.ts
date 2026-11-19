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

  constructor(private router: Router, private authService: AuthService) {}

  login() {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('taskflow_user', this.email);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid email or password.';
      }
    });
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    this.errorMessage = 'Password recovery will be available soon.';
  }

  googleLogin() {
    this.errorMessage = 'Google login will be connected later.';
  }

  createAccount(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Enter your email and password above, then click Create account.';
      return;
    }

    const derivedName = this.email.split('@')[0].replace(/[^a-zA-Z]/g, '') || 'User';

    this.authService.register({
      name: derivedName,
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.login();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed.';
      }
    });
  }
}