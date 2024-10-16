
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/environment';
import { AuthService } from './auth.service';
import { Message } from '../component/Types/channelTypes';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = environment.BASE_URL;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // This method is available for both admin and regular users
  getCategories(): Observable<{ name: string; _id: string }[]> {
    return this.http.get<{ name: string; _id: string }[]>(
      `${this.baseUrl}admin/categories`,
      { headers: this.getHeaders() }
    );
  }

  // Admin-only methods
  addCategory(name: string): Observable<Message> {
    return this.authService.adminRequest('addCategory', 'post', { name });
  }

  updateCategory(id: string, name: string): Observable<Message> {
    return this.authService.adminRequest(`updateCategory/${id}`, 'put', { name });
  }

  deleteCategory(id: string): Observable<Message> {
    return this.authService.adminRequest(`deleteCategory/${id}`, 'delete');
  }

  // If you need any non-admin specific category operations, you can add them like this:
  getCategoryDetails(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}categories/${id}`);
  }
}