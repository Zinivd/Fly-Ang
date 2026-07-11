import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from '../../../service/api-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private api: ApiServiceService,
  ) {}

  // 'otp' | 'password'
  loginMode: 'otp' | 'password' = 'otp';

  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  setLoginMode(mode: 'otp' | 'password'): void {
    this.loginMode = mode;
  }

  submit(): void {
    if (this.loginMode === 'otp') {
      this.sendOtp();
    } else {
      this.loginWithPassword();
    }
  }

  sendOtp(): void {
    if (!this.email.trim()) {
      this.toastr.error('Please enter your email ID');
      return;
    }

    if (!this.isValidEmail(this.email.trim())) {
      this.toastr.error('Please enter a valid email ID');
      return;
    }

    const payload = {
      login_field: this.email.trim(),
    };

    this.isLoading = true;

    this.api.loginOtp<any>(payload).subscribe({
      next: (response) => {
        this.isLoading = false;

        const otpToken =
          response?.login_otp_token ??
          response?.data?.login_otp_token ??
          response?.result?.login_otp_token;

        if (!otpToken) {
          this.toastr.error('Something went wrong. Please try again.');
          return;
        }

        this.toastr.success('OTP sent successfully!');

        // Tag this as a 'login' flow so the shared OTP screen knows
        // which token field / endpoint to use on verify.
        sessionStorage.setItem('otpToken', otpToken);
        sessionStorage.setItem('otpFlow', 'login');
        sessionStorage.setItem('registerEmail', this.email.trim());
        sessionStorage.removeItem('registerName');

        this.router.navigate(['/otp'], {
          state: {
            otpToken,
            otpFlow: 'login',
            email: this.email.trim(),
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(
          err?.error?.error?.message ||
            err?.error?.message ||
            'Failed to send OTP',
        );
      },
    });
  }

  loginWithPassword(): void {
    if (!this.email.trim()) {
      this.toastr.error('Please enter your email ID');
      return;
    }

    if (!this.isValidEmail(this.email.trim())) {
      this.toastr.error('Please enter a valid email ID');
      return;
    }

    if (!this.password.trim()) {
      this.toastr.error('Please enter your password');
      return;
    }

    const payload = {
      email: this.email.trim(),
      password: this.password,
    };

    this.isLoading = true;

    this.api.loginwithEmail<any>(payload).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response?.access_token) {
          localStorage.setItem('authToken', response.access_token);
        }
        if (response?.refresh_token) {
          localStorage.setItem('refreshToken', response.refresh_token);
        }
        if (response?.user_id) {
          localStorage.setItem('userId', response.user_id);
        }
        if (response?.expires_in) {
          const expiresAt = Date.now() + response.expires_in * 1000;
          localStorage.setItem('tokenExpiresAt', String(expiresAt));
        }

        this.toastr.success('Logged in successfully!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(
          err?.error?.error?.message ||
            err?.error?.message ||
            'Invalid email or password',
        );
      },
    });
  }
}