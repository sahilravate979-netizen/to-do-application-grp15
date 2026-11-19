import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css'
})
export class AdminReports implements OnInit {
  users: any[] = [];
  private adminUrl = 'http://localhost:3000/api/admin';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadReportsData();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadReportsData() {
    const headers = this.getHeaders();

    this.http.get<any>(`${this.adminUrl}/users`, { headers }).pipe(
      switchMap((res) => {
        const regularUsers = (res.users || []).filter((u: any) => u.role === 'User');
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
      },
      error: (err) => {
        console.error('Failed to load admin reports:', err);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/admin-login']);
        }
      }
    });
  }

  get allTasks() {
    return this.users.flatMap(user => user.tasks);
  }

  get completedTasks() {
    return this.allTasks.filter(task => task.status === 'Completed').length;
  }

  get pendingTasks() {
    return this.allTasks.filter(task => task.status === 'Pending').length;
  }

  get inProgressTasks() {
    return this.allTasks.filter(task => task.status === 'In Progress').length;
  }

  get overallProgress() {
    return this.allTasks.length
      ? Math.round((this.completedTasks / this.allTasks.length) * 100)
      : 0;
  }

  getUserProgress(user: any) {
    if (!user.tasks || user.tasks.length === 0) {
      return 0;
    }
    const completed = user.tasks.filter(
      (task: any) => task.status === 'Completed'
    ).length;

    return Math.round((completed / user.tasks.length) * 100);
  }
}