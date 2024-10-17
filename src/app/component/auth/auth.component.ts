// auth.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { CustomValidators } from '../Enums & Constraints/validator';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  @Input() mode: 'login' | 'signup' = 'login';
  authForm!: FormGroup;
  errorMessage: string = '';
  special: string = '';
  passwordHidden = true;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    private _toastService: ToastService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    if (this.mode === 'login') {
      this.authForm = this._fb.group(CustomValidators.getLoginFormControls());
    } else {
      this.authForm = this._fb.group(
        CustomValidators.getSignupFormControls(),
        { validator: CustomValidators.passwordMatchValidator }
      );
    }
  }

  onSubmit() {
    if (this.authForm.valid) {
      const authObservable = this.mode === 'login' 
        ? this._authService.login(this.authForm.value)
        : this._authService.signup(this.authForm.value);

      this.subscriptions.add(
        authObservable.subscribe({
          next: (res: any) => {
            if (this.mode === 'login') {
              this.handleLoginSuccess(res);
            } else {
              this.handleSignupSuccess(res);
            }
          },
          error: (err: string) => {
            this.errorMessage = err;
            console.error(`${this.mode} error:`, err);
          }
        })
      );
    }
  }

  handleLoginSuccess(res: { message: string }) {
    console.log("res.message",res.message);
    
    if (res.message === "Admin") {
      this._router.navigate(['/admin/users']);
    } else {
      this._router.navigate(['/landing']);
    }
    this._toastService.showSuccess('Login successful');
  }

  handleSignupSuccess(res: { message: string, email: string }) {
    if (res.message && res.email) {
      this._router.navigate(['/auth/otp-signup'], { state: { email: res.email } });
      this._toastService.showSuccess('Signup successful');
    }
  }

  filterInput(event: KeyboardEvent) {
    const result = CustomValidators.filterNameInput(event);
    if (result.isInvalid) {
      this.special = result.message;
      setTimeout(() => {
        this.special = '';
      }, 5000);
      event.preventDefault();
    }
  }

  togglePasswordVisibility(field: string) {
    const inputField = document.getElementById(field) as HTMLInputElement;
    inputField.type = this.passwordHidden ? 'text' : 'password';
    this.passwordHidden = !this.passwordHidden;
  }

  googleAuth(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this._authService.googleAuth().subscribe({
        next: (successResponse: any) => {
          if (successResponse.message) {
            console.log('Google auth response', successResponse);
            // Handle successful Google auth
          }
        },
        error: (error) => {
          console.error('Google auth error', error);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}