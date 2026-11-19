import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

interface Task {
  id: number;
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
export class Tasks {

  constructor(private router: Router) {
    this.loadTasks();
  }

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

  tasks: Task[] = [
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

  loadTasks() {
    const storedTasks = localStorage.getItem('taskflow_tasks');

    if (storedTasks) {
      try {
        const savedTasks = JSON.parse(storedTasks);

        this.tasks = [
          ...this.tasks.filter(
            task => !savedTasks.some((saved: any) => saved.id === task.id)
          ),
          ...savedTasks.map((task: any) => ({
            ...task,
            time: task.dueDate || task.time || 'No due date',
            dueGroup: task.dueGroup ||
              (task.dueDate === new Date().toISOString().split('T')[0]
                ? 'Today'
                : 'Upcoming')
          }))
        ];
      } catch {
        console.error('Unable to load saved tasks.');
      }
    }

    this.saveTasks();
  }

  saveTasks() {
    localStorage.setItem(
      'taskflow_tasks',
      JSON.stringify(this.tasks)
    );
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(task => {
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
      task => task.dueGroup === 'Today'
    );
  }

  get upcomingTasks(): Task[] {
    return this.filteredTasks.filter(
      task => task.dueGroup === 'Upcoming'
    );
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
  }

  toggleTask(task: Task) {
    task.status = task.status === 'Done' ? 'Pending' : 'Done';
    this.saveTasks();
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

    const task: Task = {
      id: Date.now(),
      title: this.newTask.title,
      description: this.newTask.description,
      priority: this.newTask.priority,
      time: this.newTask.dueDate || 'No due date',
      dueDate: this.newTask.dueDate,
      category: this.newTask.category,
      status: 'Pending',
      dueGroup: 'Upcoming'
    };

    this.tasks.push(task);
    this.saveTasks();

    this.newTask = {
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
      category: 'Work'
    };

    this.showAddForm = false;
  }

  deleteTask(id: number) {
    this.tasks = this.tasks.filter(
      task => task.id !== id
    );

    this.saveTasks();
  }
}