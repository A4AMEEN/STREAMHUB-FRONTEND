
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Message, user } from '../Types/userTypes';
import { Channel, ChannelData } from '../Types/channelTypes';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../Reusables/error.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user!: user
  channel: any
  oldPassword: string = '';
  newPassword: string = '';
  showChangePassword: boolean = false;
  error: string = '';
  passwordError: string = '';

  constructor(private _authService: AuthService, private _router: Router,   private _dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.user = this._authService.getUserData();
    this.channel = this._authService.getChannelData();
    console.log("Channel from profile component", this.user);
    // Retrieve channel data from localStorage
  }

  logout(): void {
    this._authService.logout();
  }

  resetPassword(): void {
    if (!this.oldPassword || !this.newPassword || this.newPassword.length < 8) {
      this.passwordError = 'Password must be strong and at least 8 characters long';
      return;
    }

    console.log("changePassword",this.user.id);
    if(!this.user._id){
      this.showError('userid missing');
      return
    }
    this._authService.changePassword(this.user._id, this.oldPassword, this.newPassword).subscribe({
      next: (response:Message) => {
        console.log("changePassword",response);
        
        this._router.navigate(['/landing']);
      }, 
      error: (error) => {
        this.error = error.error.message;
        this.showError(this.error );
      },
      complete: () => {
       this.showError('Password reset process completed');
      }
    });
  }

  isSidebarExpanded: boolean = false;

  toggleSidebar(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }
  showError(errorMessage: string) {
    this._dialog.open(ErrorDialogComponent, {
      data: { message: errorMessage },
      width: '300px'
    });
  }
}
