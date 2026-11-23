
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  RouterLink,
  Router,
  NavigationEnd
} from '@angular/router';

import { filter, Subscription } from 'rxjs';
import {
  Task as TaskService,
  TaskItem
} from '../../services/task';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './insights.html',
  styleUrl: './insights.css'
})
export class Insights implements OnInit, OnDestroy {

  totalTasks = 0;
  pendingTasks = 0;
  inProgressTasks = 0;
  completedTasks = 0;

  private routerSubscription?: Subscription;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.loadInsights();

    this.routerSubscription = this.router.events
      .pipe(
        filter(event =>
          event instanceof NavigationEnd &&
          event.urlAfterRedirects === '/insights'
        )
      )
      .subscribe(() => {
        this.loadInsights();
      });
  }

  loadInsights(): void {

    this.taskService.getTasks().subscribe({

      next: (res) => {

        console.log('INSIGHTS API RESPONSE:', res);

        const tasks: TaskItem[] = Array.isArray(res?.data)
          ? res.data
          : [];

        this.totalTasks = tasks.length;

        this.pendingTasks = tasks.filter(
          task =>
            task.status?.trim().toLowerCase() === 'pending'
        ).length;

        this.inProgressTasks = tasks.filter(
          task => {
            const status = task.status?.trim().toLowerCase();

            return status === 'in progress' ||
                   status === 'in-progress';
          }
        ).length;

        this.completedTasks = tasks.filter(
          task => {
            const status = task.status?.trim().toLowerCase();

            return status === 'completed' ||
                   status === 'done';
          }
        ).length;

        console.log('TOTAL:', this.totalTasks);
        console.log('PENDING:', this.pendingTasks);
        console.log('IN PROGRESS:', this.inProgressTasks);
        console.log('COMPLETED:', this.completedTasks);

        // Update the Angular view
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load insights:', error);
      }

    });
  }

  get completionRate(): number {

    if (this.totalTasks === 0) {
      return 0;
    }

    return Math.round(
      (this.completedTasks / this.totalTasks) * 100
    );
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}
