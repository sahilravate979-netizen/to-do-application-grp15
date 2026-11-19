import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Tasks } from './pages/tasks/tasks';
import { NewTask } from './pages/new-task/new-task';
import { AdminLogin } from './pages/admin-login/admin-login';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { RoleSelection } from './pages/role-selection/role-selection';
import { AdminReports } from './pages/admin-reports/admin-reports';

export const routes: Routes = [
  { path: '', component: RoleSelection },
  { path: 'user-login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'tasks', component: Tasks },
  { path: 'new-task', component: NewTask },
  { path: 'admin-login', component: AdminLogin },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'admin-reports', component: AdminReports },
  { path: '**', redirectTo: '' }
];