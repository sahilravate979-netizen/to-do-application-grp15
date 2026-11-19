import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Task {
  id: number;
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
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  greeting = 'Good morning';
  date = 'Wednesday, 18 November';

  tasks: Task[] = [];

  constructor() {
    this.loadTasks();
  }

  loadTasks() {
    const storedTasks = localStorage.getItem('taskflow_tasks');

    const defaultTasks: Task[] = [
      {
        id: 1,
        title: 'Send project update',
        priority: 'High',
        time: '5:00 PM',
        category: 'Work',
        status: 'Pending',
        dueGroup: 'Today'
      },
      {
        id: 2,
        title: 'Write API documentation',
        priority: 'Medium',
        time: '6:30 PM',
        category: 'Work',
        status: 'In progress',
        dueGroup: 'Today'
      },
      {
        id: 3,
        title: 'Plan weekly groceries',
        priority: 'Low',
        time: 'Fri, 20 Nov',
        category: 'Personal',
        status: 'Pending',
        dueGroup: 'Upcoming'
      },
      {
        id: 4,
        title: 'Book dentist',
        priority: 'Low',
        time: 'Completed',
        category: 'Personal',
        status: 'Done',
        dueGroup: 'Upcoming'
      }
    ];

    if (storedTasks) {
      try {
        this.tasks = JSON.parse(storedTasks);
      } catch {
        this.tasks = defaultTasks;
      }
    } else {
      this.tasks = defaultTasks;
    }
  }

  get stats() {
    return [
      {
        title: 'Pending',
        count: this.tasks.filter(task => task.status === 'Pending').length
      },
      {
        title: 'In progress',
        count: this.tasks.filter(task => task.status === 'In progress').length
      },
      {
        title: 'Completed',
        count: this.tasks.filter(task => task.status === 'Done').length
      }
    ];
  }

  get progress(): number {
    if (this.tasks.length === 0) {
      return 0;
    }

    const completed = this.tasks.filter(
      task => task.status === 'Done'
    ).length;

    return Math.round((completed / this.tasks.length) * 100);
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