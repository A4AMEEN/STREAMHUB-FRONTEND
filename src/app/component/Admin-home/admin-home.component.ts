import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent {

  constructor(private _router: Router, private _authService: AuthService) {}

  logout() {
    this._authService.logout();
    this._router.navigate(['/auth/login']);
  }
}