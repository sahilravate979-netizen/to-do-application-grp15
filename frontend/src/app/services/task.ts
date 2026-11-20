import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskItem {
  id?: number;
  task_id?: number;
  user_id?: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  deadline?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Task {
  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  getTasks(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getTask(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createTask(taskData: TaskItem): Observable<any> {
    return this.http.post<any>(this.apiUrl, taskData, { headers: this.getAuthHeaders() });
  }

  updateTask(id: number | string, taskData: Partial<TaskItem>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, taskData, { headers: this.getAuthHeaders() });
  }

  deleteTask(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}