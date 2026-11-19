import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {

  email = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

  login() {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter your admin email and password.';
      return;
    }

    // Demo navigation until backend authentication is connected
    localStorage.setItem('taskflow_role', 'admin');

    this.router.navigate(['/admin-dashboard']);
  }
}