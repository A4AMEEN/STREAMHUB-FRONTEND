import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/environment';
import { AuthService } from './auth.service'; // Import AuthService
import { BlockUserResponse, FetchUsersResponse, Message } from '../component/Types/userTypes';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.BASE_URL;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getUsers(): Observable<FetchUsersResponse> {
    return this.authService.adminRequest('users', 'get');
  }

  blockUser(userId: string): Observable<BlockUserResponse> {
    return this.authService.adminRequest(`blockuser/${userId}`, 'put');
  }

  resetPassword(email: string, newPassword: string): Observable<Message> {
    return this.http.post(`${this.baseUrl}users/forgot-password`, 
      { email, newPassword }, 
      { headers: this.getHeaders() }
    );
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<Message> {
    return this.http.post(`${this.baseUrl}users/reset-password`, 
      { userId, oldPassword, newPassword }, 
      { headers: this.getHeaders() }
    );
  }
}