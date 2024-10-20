import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { environment } from '../../env/environment';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';
import { UserRole } from '../component/Enums & Constraints/userRole';
import { Message, otp, Otp, OtpResponse } from '../component/Types/userTypes';
import { Channel } from '../component/Types/channelTypes';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.BASE_URL;
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';
  private userRoleKey = 'userRole';
  private channelKey = 'channelKey';
  private GOOGLE_URL = 'GOOGLE_URL';
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(this.getToken());

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isInBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  signup(userData: any): Observable<any> {
    console.log("user for signup",userData);
    
    return this.http.post(`${this.baseUrl}users/signup`, userData);
  }

  login(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}users/login`, userData).pipe(
      tap(response => {
        console.log("login res", response);
        if (response.token && response.message && response.channel) {
          this.setSession(response);
        }
      })
    );
  }

  checkTokenExpiration(): boolean {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        console.log('Token expired');
        return true;
      }
    }
    return false;
  }

  private setSession(authResult: any) {
    if (this.isInBrowser()) {
      localStorage.setItem(this.tokenKey, authResult.token);
      localStorage.setItem(this.refreshTokenKey, authResult.refreshToken);
      localStorage.setItem(this.userRoleKey, authResult.message);
      localStorage.setItem(this.channelKey, JSON.stringify(authResult.channel));
    }
    this.tokenSubject.next(authResult.token);
    this.refreshTokenSubject.next(authResult.refreshToken);
  }

  getRefreshToken(): string | null {
    return this.isInBrowser() ? localStorage.getItem(this.refreshTokenKey) : null;
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
    }
    return this.http.post<any>(`${this.baseUrl}users/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        if (response.token) {
          console.log("Token refreshed");
          if (this.isInBrowser()) {
            localStorage.setItem(this.tokenKey, response.token);
          }
          this.tokenSubject.next(response.token);
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(error);
      })
    );
  }

  googleAuth(): Observable<any> {
    try {
      return this.http.get<any>(`${this.GOOGLE_URL}users/google`);
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  logout(): void {
    if (this.isInBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.userRoleKey);
      localStorage.removeItem(this.channelKey);
    }
    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.router.navigate(['/landing']);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    const decodedToken: any = jwtDecode(token);
    console.log("istokensexpited", decodedToken);
    return decodedToken.exp * 1000 < Date.now();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return this.isInBrowser() ? localStorage.getItem(this.tokenKey) : null;
  }

  getUserRole(): UserRole | null {
    if (!this.isInBrowser()) return null;
    const role = localStorage.getItem(this.userRoleKey);
    return role ? (role as UserRole) : null;
  }

  isUserAdmin(): boolean {
    return this.getUserRole() === UserRole.Admin;
  }

  isUserRegular(): boolean {
    return this.getUserRole() === 'Login SuccessFully';
  }

  getUserData(): any {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token);
    }
    return null;
  }

  getCurrentUserId(): string | null {
    const userData = this.getUserData();
    return userData ? userData._id : null;
  }

  getChannelData(): Channel |null{
    if (!this.isInBrowser()) return null;
    const channelData = localStorage.getItem(this.channelKey);
    return channelData ? JSON.parse(channelData) : null;
  }

  getChannelId(): Channel |any{
    if (!this.isInBrowser()) return null;
    const channelData = localStorage.getItem(this.channelKey);
    console.log("freeee", channelData);
    return channelData ? JSON.parse(channelData) : null;
  }

  sendOtp(email: string): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.baseUrl}users/send-otp`, { email });
  }

  resendOtp(email: string): Observable<Otp> {
    return this.http.post(`${this.baseUrl}users/resend-otp`, { email });
  }

  verifyOtpAndCreateUser(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}users/otpSignup`, { email, otp });
  }

  verifyOtp(email: string, otp: string): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}users/verify-otp`, { email, otp });
  }

  resetPassword(email: string, newPassword: string): Observable<Message> {
    return this.http.post(`${this.baseUrl}users/forgot-password`, { email, newPassword });
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<Message> {
    return this.http.post(`${this.baseUrl}users/reset-password`, { userId, oldPassword, newPassword });
  }

  adminRequest(endpoint: string, method: string, body?: any): Observable<any> {
    const url = `${this.baseUrl}admin/${endpoint}`;

    switch (method.toLowerCase()) {
      case 'get':
        return this.http.get(url);
      case 'post':
        return this.http.post(url, body);
      case 'put':
        return this.http.put(url, body);
      case 'delete':
        return this.http.delete(url);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}