
import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Tasks } from './pages/tasks/tasks';
import { NewTask } from './pages/new-task/new-task';

import { AdminLogin } from './pages/admin-login/admin-login';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { AdminReports } from './pages/admin-reports/admin-reports';

import { RoleSelection } from './pages/role-selection/role-selection';
import { Insights } from './pages/insights/insights';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  // Main page
  { path: '', component: RoleSelection },

  // User pages
  { path: 'user-login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'tasks', component: Tasks },
  { path: 'new-task', component: NewTask },
  { path: 'insights', component: Insights },
  { path: 'profile', component: Profile },

  // Admin pages
  { path: 'admin-login', component: AdminLogin },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'admin-reports', component: AdminReports },

  // Unknown routes
  { path: '**', redirectTo: '' }
];
