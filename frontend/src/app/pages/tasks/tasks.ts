
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Task as TaskService, TaskItem } from '../../services/task';

interface Task {
  id: number | string;
  title: string;
  priority: string;
  time: string;
  category: string;
  status: string;
  dueGroup: string;
  description?: string;
  dueDate?: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class Tasks implements OnInit {
  selectedFilter = 'All';
  searchText = '';
  showAddForm = false;

  newTask = {
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    category: 'Work'
  };

  tasks: Task[] = [];

  constructor(
    private router: Router,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  // Load tasks from the backend API
  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (res) => {
        const apiTasks: TaskItem[] = res?.data || [];
        this.tasks = apiTasks.map((task) =>
          this.mapApiTaskToUi(task)
        );
      },
      error: (err) => {
        console.error(
          'Failed to load tasks from API, falling back to localStorage:',
          err
        );
        this.loadLocalFallback();
      }
    });
  }

  // Convert backend task data into the UI task format
  private mapApiTaskToUi(t: TaskItem): Task {
    const due = t.dueDate || t.deadline || '';
    const today = new Date().toISOString().split('T')[0];

    return {
      id: t.id || t.task_id || 0,
      title: t.title,
      priority: t.priority || 'Medium',
      time: due || 'No due date',
      category: (t as any).category || 'Personal',
      status: t.status || 'Pending',
      dueGroup: !due || due.startsWith(today)
        ? 'Today'
        : 'Upcoming',
      description: t.description || '',
      dueDate: due
    };
  }

  // Load locally saved tasks if the API fails
  private loadLocalFallback(): void {
    const storedTasks = localStorage.getItem('taskflow_tasks');

    if (storedTasks) {
      try {
        this.tasks = JSON.parse(storedTasks);
      } catch {
        console.error('Unable to load saved tasks.');
      }
    }
  }

  // Apply status filter and search
  get filteredTasks(): Task[] {
    return this.tasks.filter((task) => {
      const matchesFilter =
        this.selectedFilter === 'All' ||
        (this.selectedFilter === 'Done'
          ? task.status === 'Done' || task.status === 'Completed'
          : task.status === this.selectedFilter);

      const matchesSearch = task.title
        .toLowerCase()
        .includes(this.searchText.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }

  // Today's tasks
  get todayTasks(): Task[] {
    return this.filteredTasks.filter(
      (task) => task.dueGroup === 'Today'
    );
  }

  // Upcoming tasks
  get upcomingTasks(): Task[] {
    return this.filteredTasks.filter(
      (task) => task.dueGroup === 'Upcoming'
    );
  }

  // Change selected filter
  selectFilter(filter: string): void {
    this.selectedFilter = filter;
  }

  // Mark a task as completed or pending
  toggleTask(task: Task): void {
    const previousStatus = task.status;

    const isDone =
      task.status === 'Done' || task.status === 'Completed';

    const nextStatus = isDone ? 'Pending' : 'Completed';

    task.status = nextStatus;

    this.taskService.updateTask(task.id, {
      status: nextStatus
    }).subscribe({
      error: (err) => {
        task.status = previousStatus;
        console.error('Failed to update task status:', err);
      }
    });
  }

  // Navigate to the New Task page
  openAddForm(): void {
    this.router.navigate(['/new-task']);
  }

  // Close add task form
  closeAddForm(): void {
    this.showAddForm = false;
  }

  // Create a new task
  addTask(): void {
    if (!this.newTask.title.trim()) {
      return;
    }

    this.taskService.createTask({
      title: this.newTask.title.trim(),
      description: this.newTask.description,
      priority: this.newTask.priority,
      dueDate: this.newTask.dueDate,
      status: 'Pending',
      ...({ category: this.newTask.category } as any)
    }).subscribe({
      next: (res) => {
        if (res?.data) {
          this.tasks.push(this.mapApiTaskToUi(res.data));
        } else {
          this.loadTasks();
        }

        this.newTask = {
          title: '',
          description: '',
          priority: 'Medium',
          dueDate: '',
          category: 'Work'
        };

        this.showAddForm = false;
      },
      error: (err) => {
        console.error('Failed to create task:', err);
      }
    });
  }

  // Delete a task
  deleteTask(id: number | string): void {
    const previousTasks = [...this.tasks];

    this.tasks = this.tasks.filter(
      (task) => task.id !== id
    );

    this.cdr.detectChanges();

    this.taskService.deleteTask(id).subscribe({
      error: (err) => {
        this.tasks = previousTasks;
        this.cdr.detectChanges();
        console.error('Failed to delete task:', err);
      }
    });
  }
}
