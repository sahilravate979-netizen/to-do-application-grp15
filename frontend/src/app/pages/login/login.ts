import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  login() {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    // Demo login until backend authentication is connected
    localStorage.setItem('taskflow_user', this.email);

    this.router.navigate(['/dashboard']);
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
    this.errorMessage = 'Account registration will be available soon.';
  }
}