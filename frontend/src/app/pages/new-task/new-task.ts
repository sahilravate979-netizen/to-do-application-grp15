import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Task as TaskService } from '../../services/task';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-task.html',
  styleUrl: './new-task.css'
})
export class NewTask {
  task = {
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    category: 'Work'
  };

  constructor(
    private router: Router,
    private taskService: TaskService
  ) {}

  saveTask() {
    if (!this.task.title.trim()) {
      alert('Please enter task title.');
      return;
    }

    this.taskService.createTask({
      title: this.task.title.trim(),
      description: this.task.description,
      priority: this.task.priority,
      dueDate: this.task.dueDate,
      status: 'Pending',
      ...( { category: this.task.category } as any )
    }).subscribe({
      next: () => {
        alert('Task saved successfully!');
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        console.error('Failed to save task via API:', err);
        alert('Could not save task to server. Please check backend connection.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/tasks']);
  }
}