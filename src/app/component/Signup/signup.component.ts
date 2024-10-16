import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import { CustomValidators } from '../Enums & Constraints/validator';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnDestroy {
  signupForm: FormGroup;
  special: any;
  passwordHidden = true;
  errorMessage: string = '';
  private subscriptions: Subscription = new Subscription();

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.signupForm = this._fb.group(CustomValidators.getSignupFormControls(), 
      { validator: CustomValidators.passwordMatchValidator });
  }

  togglePasswordVisibility(field: string) {
    const inputField = document.getElementById(field) as HTMLInputElement;
    inputField.type = this.passwordHidden ? 'text' : 'password';
    this.passwordHidden = !this.passwordHidden;
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

  onSubmit() {
    if (this.signupForm.valid) {
      this.subscriptions.add(
        this._authService.signup(this.signupForm.value).subscribe({
          next: (res => {
            if (res && res.message && res.email) {
              this._router.navigate(['/auth/otp-signup'], { state: { email: res.email } });
              this._toastService.showSuccess('Signup successful');
              alert(res.message);
            }
          }),
          error: (err => {
            if (err) {
              console.log("signup error", err);
              this.errorMessage = err;
              alert(err);
            }
          })
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}