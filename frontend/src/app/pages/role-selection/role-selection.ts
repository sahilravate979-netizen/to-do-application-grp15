import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './role-selection.html',
  styleUrl: './role-selection.css'
})
export class RoleSelection {}