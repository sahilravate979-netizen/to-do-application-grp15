
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  Task as TaskService,
  TaskItem
} from '../../services/task';

interface DashboardTask {
  id: number | string;
  title: string;
  priority: string;
  time: string;
  category: string;
  status: string;
  dueGroup: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  greeting = 'Good morning';
  date = 'Wednesday, 18 November';

  tasks: DashboardTask[] = [];

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {

    this.taskService.getTasks().subscribe({

      next: (res) => {

        const apiTasks: TaskItem[] = res?.data || [];

        this.tasks = apiTasks.map((t) => ({

          id: t.id || t.task_id || 0,
          title: t.title,
          priority: t.priority || 'Medium',
          time: t.dueDate || t.deadline || 'No due date',
          category: 'Personal',
          status: t.status || 'Pending',
          dueGroup: this.getDueGroup(t.dueDate || t.deadline)

        }));

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error('Failed to fetch tasks:', err);

        this.loadLocalFallback();

        this.cdr.detectChanges();
      }

    });
  }

  private getDueGroup(dueDate?: string): string {

    if (!dueDate) {
      return 'Today';
    }

    const today = new Date().toISOString().split('T')[0];

    return dueDate.startsWith(today) ? 'Today' : 'Upcoming';
  }

  private loadLocalFallback(): void {

    const storedTasks = localStorage.getItem('taskflow_tasks');

    if (storedTasks) {

      try {
        this.tasks = JSON.parse(storedTasks);
      } catch {
        this.tasks = [];
      }

    }
  }

  get stats() {

    return [
      {
        title: 'Pending',
        count: this.tasks.filter(
          task => task.status === 'Pending'
        ).length
      },
      {
        title: 'In progress',
        count: this.tasks.filter(
          task =>
            task.status === 'In progress' ||
            task.status === 'In Progress'
        ).length
      },
      {
        title: 'Completed',
        count: this.tasks.filter(
          task =>
            task.status === 'Done' ||
            task.status === 'Completed'
        ).length
      }
    ];
  }

  get progress(): number {

    if (this.tasks.length === 0) {
      return 0;
    }

    const completed = this.tasks.filter(
      task =>
        task.status === 'Done' ||
        task.status === 'Completed'
    ).length;

    return Math.round(
      (completed / this.tasks.length) * 100
    );
  }

  get dueTasks() {

    return this.tasks
      .filter(task => task.dueGroup === 'Today')
      .map(task => ({
        title: task.title,
        priority: task.priority,
        time: task.time
      }));
  }
}
