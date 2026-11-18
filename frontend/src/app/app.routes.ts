import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Tasks } from './pages/tasks/tasks';
import { NewTask } from './pages/new-task/new-task';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'tasks', component: Tasks },
  { path: 'new-task', component: NewTask },
  { path: '**', redirectTo: '' }
];