
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Task as TaskService, TaskItem } from '../../services/task';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './insights.html',
  styleUrl: './insights.css'
})
export class Insights implements OnInit {

  totalTasks = 0;
  pendingTasks = 0;
  inProgressTasks = 0;
  completedTasks = 0;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadInsights();
  }

  loadInsights(): void {
    this.taskService.getTasks().subscribe({
      next: (res) => {
        const tasks: TaskItem[] = res?.data || [];

        this.totalTasks = tasks.length;

        this.pendingTasks = tasks.filter(
          task => task.status?.toLowerCase() === 'pending'
        ).length;

        this.inProgressTasks = tasks.filter(
          task => task.status?.toLowerCase() === 'in progress' ||
                  task.status?.toLowerCase() === 'in-progress'
        ).length;

        this.completedTasks = tasks.filter(
          task => task.status?.toLowerCase() === 'done' ||
                  task.status?.toLowerCase() === 'completed'
        ).length;
      },
      error: (error) => {
        console.error('Failed to load insights:', error);
      }
    });
  }

  get completionRate(): number {
    if (this.totalTasks === 0) return 0;

    return Math.round(
      (this.completedTasks / this.totalTasks) * 100
    );
  }
}
