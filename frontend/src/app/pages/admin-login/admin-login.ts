import { Component, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

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
        const user = res?.user || res?.data?.user;
        const token = res?.token || res?.data?.token;
        const role = (user?.role || '').toLowerCase();

        if (role !== 'admin') {
          this.errorMessage = 'Access denied. Admin privileges required.';
          this.cdr.detectChanges();
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('taskflow_role', 'admin');
        localStorage.setItem('user', JSON.stringify(user));
        this.router.navigate(['/admin-dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid admin email or password.';
        this.cdr.detectChanges();
      }
    });
  }
}