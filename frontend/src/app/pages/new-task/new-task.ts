import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  saveTask() {
    if (!this.task.title.trim()) {
      alert('Please enter task title.');
      return;
    }

    const savedTasks = JSON.parse(
      localStorage.getItem('taskflow_tasks') || '[]'
    );

    savedTasks.push({
      ...this.task,
      id: Date.now(),
      status: 'Pending'
    });

    localStorage.setItem(
      'taskflow_tasks',
      JSON.stringify(savedTasks)
    );

    alert('Task saved successfully!');
    this.router.navigate(['/tasks']);
  }

  cancel() {
    this.router.navigate(['/tasks']);
  }
}