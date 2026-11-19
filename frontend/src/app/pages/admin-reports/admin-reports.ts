import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css'
})
export class AdminReports {

  users = [
    {
      name: 'Rahul Sharma',
      tasks: [
        { title: 'Complete Web Programming Assignment', status: 'In Progress' },
        { title: 'Prepare DBMS Notes', status: 'Pending' }
      ]
    },
    {
      name: 'Aisha Khan',
      tasks: [
        { title: 'Complete Java Project', status: 'Completed' },
        { title: 'Study Operating System', status: 'In Progress' }
      ]
    },
    {
      name: 'Rohan Patil',
      tasks: [
        { title: 'Prepare Statistics Presentation', status: 'Pending' },
        { title: 'Complete Python Practice', status: 'Completed' }
      ]
    },
    {
      name: 'Sneha Joshi',
      tasks: [
        { title: 'Finish React Assignment', status: 'Completed' },
        { title: 'Prepare Project Report', status: 'Completed' }
      ]
    }
  ];

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
    const completed = user.tasks.filter(
      (task: any) => task.status === 'Completed'
    ).length;

    return Math.round((completed / user.tasks.length) * 100);
  }
}