import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../component/Login/login.component';
import { SignupComponent } from '../component/Signup/signup.component';
import { OtpComponent } from '../component/Otp/otp.component';
import { OtpSignupComponent } from '../component/Otp-Signup/otp-signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from '../Guards/auth-guard.guard';
import { AuthComponent } from '../component/auth/auth.component';

const routes: Routes = [
  { path: 'login', component: AuthComponent, data: { mode: 'login' },canActivate: [AuthGuard] },
  { path: 'signup', component: SignupComponent,canActivate: [AuthGuard]  },
  { path: 'otp', component: OtpComponent,canActivate: [AuthGuard]  },
  { path: 'otp-signup', component: OtpSignupComponent,canActivate: [AuthGuard]  }
];

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    OtpComponent,
    OtpSignupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }