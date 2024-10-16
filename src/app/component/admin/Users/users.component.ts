import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlockUserResponse, FetchUsersResponse, Message, User } from '../../Types/userTypes';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  paginatedUsers: User[] = [];
  errorMessage: string = '';
  currentPage: number = 1;
  usersPerPage: number = 7;
  private destroy$ = new Subject<void>();

  constructor(private _userService: UserService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

 

  fetchUsers(): void {
    this._userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: { users: User[]; }) => {
          
          
          this.users = response.users;
          this.updatePaginatedUsers();
        },
        error: (error: { error: { message: string; }; }) => {
          this.errorMessage = error.error.message || 'Error fetching users';
        }
      });
  }

  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.usersPerPage;
    const endIndex = startIndex + this.usersPerPage;
    this.paginatedUsers = this.users.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedUsers();
  }

  get totalPages(): number {
    return Math.ceil(this.users.length / this.usersPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  blockUser(userId: string): void {
    if (window.confirm('Are you sure you want to perform this action?')) {
      this._userService.blockUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: BlockUserResponse) => {
            console.log("fetchusers",res);
            this.fetchUsers()
            if (res.updated) {
              const updatedUser = res.user;
              const mainIndex = this.users.findIndex(user => user.id === updatedUser.id);
              if (mainIndex !== -1) {
                this.users[mainIndex] = updatedUser;
              }
              const paginatedIndex = this.paginatedUsers.findIndex(user => user._id === updatedUser._id);
              if (paginatedIndex !== -1) {
                this.paginatedUsers[paginatedIndex] = updatedUser;
              }
              this.paginatedUsers = [...this.paginatedUsers];
            } else {
              console.error('Failed to update user status');
            }
            
          },
          error: (error) => {
            this.errorMessage = error.error.message || 'Error blocking user';
          }
        });
    } else {
      console.log('User cancelled the action.');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}