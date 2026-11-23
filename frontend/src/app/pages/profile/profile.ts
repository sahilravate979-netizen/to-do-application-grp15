
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  name = 'Loading...';
  email = 'Loading...';
  accountType = 'User';

  errorMessage = '';
  isLoading = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  // LOAD LOGGED-IN USER PROFILE
  loadProfile(): void {

    const token = localStorage.getItem('token');

    if (!token) {
      this.errorMessage = 'Please log in to view your profile.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.authService.getProfile().subscribe({

      next: (res: any) => {

        console.log('Profile API response:', res);

        // Your backend returns the user inside res.user
        const user = res.user;

        if (user) {

          this.name = user.name || 'User';
          this.email = user.email || 'Not available';
          this.accountType = user.role || 'User';

          // Save latest profile details locally
          localStorage.setItem(
            'taskflow_user_details',
            JSON.stringify(user)
          );

        } else {
          this.errorMessage = 'User details were not found.';
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error('Profile loading error:', err);

        this.errorMessage =
          err.error?.message || 'Unable to load your profile.';

        this.isLoading = false;
        this.cdr.detectChanges();
      }

    });
  }

  // LOGOUT
  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('taskflow_user');
    localStorage.removeItem('taskflow_user_details');

    this.router.navigate(['/user-login']);
  }
}
