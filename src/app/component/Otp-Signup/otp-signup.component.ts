import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-otp-signup',
  templateUrl: './otp-signup.component.html',
  styleUrls: ['./otp-signup.component.css']
})
export class OtpSignupComponent implements OnInit, OnDestroy {
  otpForm: FormGroup;
  errorMessage: string = '';
  email: string;
  timeLeft: number = 60;
  timerSubscription: Subscription | null = null;
  showResendButton: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private _fb: FormBuilder, 
    private _authService: AuthService, 
    private _router: Router
  ) {
    this.otpForm = this._fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    const navigation = this._router.getCurrentNavigation();
    this.email = navigation?.extras.state?.['email'];
  }

  ngOnInit() {
    if (!this.email) {
      this._router.navigate(['/signup']);
    } else {
      this.startTimer();
    }
  }

  ngOnDestroy() {
    this.stopTimer();
    this.subscriptions.unsubscribe(); 
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

  resendOtp() {
    const resendOtpSubscription = this._authService.resendOtp(this.email).subscribe({
      next: (res) => {
        alert('OTP resent successfully');
        this.startTimer();
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Failed to resend OTP';
      }
    });
    this.subscriptions.add(resendOtpSubscription);
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;
    const otp = this.otpForm.value.otp;
    
    const verifyOtpSubscription = this._authService.verifyOtpAndCreateUser(this.email, otp).subscribe({
      next: (res) => {
        alert(res.message);
        this._router.navigate(['/auth/login']);
      },
      error: (error) => {
        
        this.errorMessage = error.message || 'Invalid OTP';
      }
    });
    this.subscriptions.add(verifyOtpSubscription);
  }
}
