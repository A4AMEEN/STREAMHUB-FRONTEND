// otp.component.ts
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class  OtpComponent implements OnInit, OnDestroy {
  @Input() mode: 'reset' | 'signup' = 'reset';
  @Input() email: string = '';

  otpForm!: FormGroup;
  emailForm!: FormGroup;
  passwordForm!: FormGroup;
  step: number = 1;
  errorMessage: string = '';
  timeLeft: number = 60;
  timerSubscription: Subscription | null = null;
  showResendButton: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router
  ) {
    this.initForms();
  }

  ngOnInit() {
    if (this.mode === 'signup' && !this.email) {
      this._router.navigate(['/signup']);
    } else if (this.mode === 'signup') {
      this.step = 2;
      this.startTimer();
    }
  }

  ngOnDestroy() {
    this.stopTimer();
    this.subscriptions.unsubscribe();
  }

  initForms() {
    this.emailForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this._fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.passwordForm = this._fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  startTimer() {
    this.timeLeft = 60;
    this.showResendButton = false;
    this.stopTimer();
    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.timeLeft > 0))
      .subscribe(() => {
        this.timeLeft--;
        if (this.timeLeft === 0) {
          this.showResendButton = true;
        }
      });

    this.subscriptions.add(this.timerSubscription);
  }

  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  sendOtp() {
    if (this.emailForm.invalid) return;
    this.email = this.emailForm.value.email;
    this.subscriptions.add(
      this._authService.sendOtp(this.email).subscribe({
        next: () => {
          this.step = 2;
          this.startTimer();
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Error sending OTP';
        }
      })
    );
  }

  resendOtp() {
    const resendOtpObservable = this.mode === 'reset' ? 
      this._authService.sendOtp(this.email) : 
      this._authService.resendOtp(this.email);

      const resendOtpSubscription = this._authService.resendOtp(this.email).subscribe({
        next: (res) => {
          alert('OTP resent successfully');
          this.startTimer();
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Failed to resend OTP';
        }
      });
  
      // Add resendOtp subscription to the subscriptions list
      this.subscriptions.add(resendOtpSubscription);
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;
    const otp = this.otpForm.value.otp;
    
    const verifyOtpObservable = this.mode === 'reset' ?
      this._authService.verifyOtp(this.email, otp) :
      this._authService.verifyOtpAndCreateUser(this.email, otp);

    this.subscriptions.add(
      verifyOtpObservable.subscribe({
        next: (res) => {
          if (this.mode === 'reset') {
            this.step = 3;
          } else {
            alert(res.message);
            this._router.navigate(['/auth/login']);
          }
        },
        error: (error) => {
          this.errorMessage = error.message || 'Invalid OTP';
        }
      })
    );
  }

  resetPassword() {
    if (this.passwordForm.invalid) return;
    const { newPassword } = this.passwordForm.value;
    this.subscriptions.add(
      this._authService.resetPassword(this.email, newPassword).subscribe({
        next: () => {
          alert('Password reset successfully');
          this._router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Error resetting password';
        }
      })
    );
  }
}