/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomValidators } from '../Enums & Constraints/validator';
import { Message } from '../Types/userTypes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  emailError: string | null = null;
  passwordError: string | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router
  ) {
    this.loginForm = this._fb.group(CustomValidators.getLoginFormControls());
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.emailError = null;
      this.passwordError = null;
      this.subscriptions.add(
        this._authService.login(this.loginForm.value).subscribe({
          next: (res: { message: string }) => {
            //console.log("Logged in", res.message);
            if (res.message === "Admin") {
              this._router.navigate(['/admin/users']);
            } else if (res && res.message) {
              this._router.navigate(['/landing']);
            }
          },
          error: (err: string) => {
            //console.log("Login error");
            if (err) {
              this.emailError = err;
              this.passwordError = err;
            }
          }
        })
      );
    }
  }

  googleclick(event: Event): void {
    //console.log('click');
    this.subscriptions.add(
      this._authService.googleAuth().subscribe({
        next: (successResponse: Message) => {
          if (successResponse.message) {
            //console.log('response', successResponse);
          }
        },
        error: (error) => {
          console.error('Google auth error', error);
        }
      })
    );
  }
}