import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  users: any[] = [];
  private adminUrl = 'http://localhost:3000/api/admin';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAdminData();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadAdminData() {
    const headers = this.getHeaders();

    this.http.get<any>(`${this.adminUrl}/users`, { headers }).pipe(
      switchMap((res) => {
        const regularUsers = (res.users || []).filter(
          (u: any) => (u.role || '').toLowerCase() === 'user'
        );
        if (regularUsers.length === 0) {
          return of([]);
        }

        const taskRequests = regularUsers.map((u: any) =>
          this.http.get<any>(`${this.adminUrl}/users/${u.user_id}/tasks`, { headers }).pipe(
            map((taskRes) => ({
              user_id: u.user_id,
              name: u.name,
              email: u.email,
              tasks: taskRes.tasks || []
            })),
            catchError(() => of({ user_id: u.user_id, name: u.name, email: u.email, tasks: [] }))
          )
        );

        return forkJoin(taskRequests);
      })
    ).subscribe({
      next: (usersWithTasks: any) => {
        this.users = usersWithTasks;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load admin dashboard data:', err);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/admin-login']);
        }
      }
    });
  }

  get totalUsers() {
    return this.users.length;
  }

  get allTasks() {
    return this.users.flatMap((user) => user.tasks);
  }

  get totalTasks() {
    return this.allTasks.length;
  }

  get completedTasks() {
    return this.allTasks.filter((task) => (task.status || '').toLowerCase() === 'completed').length;
  }

  get pendingTasks() {
    return this.allTasks.filter((task) => (task.status || '').toLowerCase() === 'pending').length;
  }

  get inProgressTasks() {
    return this.allTasks.filter((task) => (task.status || '').toLowerCase() === 'in progress').length;
  }

  get progress() {
    return this.totalTasks
      ? Math.round((this.completedTasks / this.totalTasks) * 100)
      : 0;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('taskflow_role');
    localStorage.removeItem('user');
    this.router.navigate(['/admin-login']);
  }
}