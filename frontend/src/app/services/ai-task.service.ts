
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GeneratedTask {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiTaskService {

  private apiUrl = 'http://localhost:3000/api/ai';

  constructor(private http: HttpClient) {}

  generateTask(input: string): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    return this.http.post(
      `${this.apiUrl}/generate-task`,
      { input },
      { headers }
    );
  }
}
