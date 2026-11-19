import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
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
  imports: [CommonModule, FormsModule, RouterLink],
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
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (res) => {
        const apiTasks: TaskItem[] = res?.data || [];
        this.tasks = apiTasks.map((t) => this.mapApiTaskToUi(t));
      },
      error: (err) => {
        console.error('Failed to load tasks from API, falling back to localStorage:', err);
        this.loadLocalFallback();
      }
    });
  }

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
      dueGroup: !due || due.startsWith(today) ? 'Today' : 'Upcoming',
      description: t.description || '',
      dueDate: due
    };
  }

  private loadLocalFallback() {
    const storedTasks = localStorage.getItem('taskflow_tasks');
    if (storedTasks) {
      try {
        this.tasks = JSON.parse(storedTasks);
      } catch {
        console.error('Unable to load saved tasks.');
      }
    }
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter((task) => {
      const matchesFilter =
        this.selectedFilter === 'All' ||
        task.status === this.selectedFilter;

      const matchesSearch =
        task.title.toLowerCase().includes(
          this.searchText.toLowerCase()
        );

      return matchesFilter && matchesSearch;
    });
  }

  get todayTasks(): Task[] {
    return this.filteredTasks.filter(
      (task) => task.dueGroup === 'Today'
    );
  }

  get upcomingTasks(): Task[] {
    return this.filteredTasks.filter(
      (task) => task.dueGroup === 'Upcoming'
    );
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
  }

  toggleTask(task: Task) {
    const nextStatus = task.status === 'Done' ? 'Pending' : 'Done';
    this.taskService.updateTask(task.id, { status: nextStatus }).subscribe({
      next: () => {
        task.status = nextStatus;
      },
      error: (err) => {
        console.error('Failed to update task status:', err);
      }
    });
  }

  openAddForm() {
    this.router.navigate(['/new-task']);
  }

  closeAddForm() {
    this.showAddForm = false;
  }

  addTask() {
    if (!this.newTask.title.trim()) {
      return;
    }

    this.taskService.createTask({
      title: this.newTask.title.trim(),
      description: this.newTask.description,
      priority: this.newTask.priority,
      dueDate: this.newTask.dueDate,
      status: 'Pending',
      ...( { category: this.newTask.category } as any )
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

  deleteTask(id: number | string) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((task) => task.id !== id);
      },
      error: (err) => {
        console.error('Failed to delete task:', err);
      }
    });
  }
}