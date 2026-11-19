import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {

  constructor(private router: Router) {}

  users = [
    {
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      tasks: [
        { title: 'Complete Web Programming Assignment', status: 'In Progress' },
        { title: 'Prepare DBMS Notes', status: 'Pending' }
      ]
    },
    {
      name: 'Aisha Khan',
      email: 'aisha@gmail.com',
      tasks: [
        { title: 'Complete Java Project', status: 'Completed' },
        { title: 'Study Operating System', status: 'In Progress' }
      ]
    },
    {
      name: 'Rohan Patil',
      email: 'rohan@gmail.com',
      tasks: [
        { title: 'Prepare Statistics Presentation', status: 'Pending' },
        { title: 'Complete Python Practice', status: 'Completed' }
      ]
    },
    {
      name: 'Sneha Joshi',
      email: 'sneha@gmail.com',
      tasks: [
        { title: 'Finish React Assignment', status: 'Completed' },
        { title: 'Prepare Project Report', status: 'Completed' }
      ]
    }
  ];

  get totalUsers() {
    return this.users.length;
  }

  get allTasks() {
    return this.users.flatMap(user => user.tasks);
  }

  get totalTasks() {
    return this.allTasks.length;
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

  get progress() {
    return this.totalTasks
      ? Math.round((this.completedTasks / this.totalTasks) * 100)
      : 0;
  }

  logout() {
    localStorage.removeItem('taskflow_role');
    this.router.navigate(['/admin-login']);
  }
}