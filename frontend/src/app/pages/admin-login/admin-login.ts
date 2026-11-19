import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  private apiUrl = 'http://localhost:3000/api/auth/login';

  constructor(private router: Router, private http: HttpClient) {}

  login() {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter your admin email and password.';
      return;
    }

    this.http.post<any>(this.apiUrl, {
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: (res) => {
        if (res.user?.role !== 'Admin') {
          this.errorMessage = 'Access denied. Admin privileges required.';
          return;
        }
        localStorage.setItem('token', res.token);
        localStorage.setItem('taskflow_role', 'admin');
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/admin-dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid admin email or password.';
      }
    });
  }
}