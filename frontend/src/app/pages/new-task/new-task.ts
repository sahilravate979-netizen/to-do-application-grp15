
import {
  Component,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Task as TaskService } from '../../services/task';
import { AiTaskService } from '../../services/ai-task.service';

interface GeneratedTask {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
  category: 'Work' | 'Personal' | 'Study';
}

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-task.html',
  styleUrl: './new-task.css'
})
export class NewTask {

  // Task form data
  task = {
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    category: 'Work'
  };

  // AI properties
  aiInput = '';
  isGeneratingAI = false;
  aiGenerated = false;
  aiError = '';

  constructor(
    private router: Router,
    private taskService: TaskService,
    private aiTaskService: AiTaskService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  // Generate all five task fields using Gemini AI
  generateTaskWithAI(): void {

    if (!this.aiInput.trim()) {
      this.aiError = 'Please describe your task first.';
      return;
    }

    this.isGeneratingAI = true;
    this.aiGenerated = false;
    this.aiError = '';

    this.aiTaskService.generateTask(this.aiInput.trim()).subscribe({

      next: (response: any) => {

        console.log('COMPLETE AI RESPONSE:', response);

        const generated: GeneratedTask = response?.data;

        console.log('GENERATED TASK DETAILS:', generated);

        // Validate AI response
        if (
          response?.success !== true ||
          !generated ||
          typeof generated.title !== 'string' ||
          typeof generated.description !== 'string' ||
          !['High', 'Medium', 'Low'].includes(generated.priority) ||
          !['Work', 'Personal', 'Study'].includes(generated.category)
        ) {

          this.ngZone.run(() => {
            this.aiError = 'AI returned invalid task details. Please try again.';
            this.isGeneratingAI = false;
            this.cdr.detectChanges();
          });

          console.error('Invalid AI response:', response);
          return;
        }

        // Populate the form inside Angular's zone
        this.ngZone.run(() => {

          this.task = {
            ...this.task,

            title: generated.title.trim(),

            description: generated.description,

            priority: generated.priority,

            dueDate: /^\d{4}-\d{2}-\d{2}$/.test(generated.deadline || '')
              ? generated.deadline
              : '',

            category: generated.category

          };

          this.aiGenerated = true;
          this.isGeneratingAI = false;

          console.log('UPDATED ANGULAR TASK FORM:', this.task);

          this.cdr.detectChanges();

        });

      },

      error: (error) => {

        console.error('AI TASK GENERATION ERROR:', error);

        this.ngZone.run(() => {

          this.aiError =
            error?.error?.message ||
            'Unable to generate task details. Please try again.';

          this.isGeneratingAI = false;

          this.cdr.detectChanges();

        });

      }

    });

  }

  // Save task using existing backend API
  saveTask(): void {

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

      error: (error) => {

        console.error('Failed to save task:', error);

        alert('Could not save task. Please check backend connection.');

      }

    });

  }

  // Cancel task creation
  cancel(): void {

    this.router.navigate(['/tasks']);

  }

}
