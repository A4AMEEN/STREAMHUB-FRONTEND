import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class ErrorResponseInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';

        if (error.error && typeof error.error === 'object' && 'message' in error.error) {
          errorMessage = error.error.message;
        } else if (error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error}`;
        } else {
          // Server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }

        if (isPlatformBrowser(this.platformId)) {
          console.error('Error caught in interceptor:', errorMessage);
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}