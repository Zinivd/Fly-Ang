import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from '../../../service/api-service.service';

function passwordMatchValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const newPwd = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (newPwd && confirm && newPwd !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password.component.html',
  styleUrl: './password.component.css',
})
export class PasswordComponent implements OnInit {
  activeTab: number = 0;

  passwordForm!: FormGroup;
  forgotPasswordForm!: FormGroup;

  // Change Password tab state
  otpSent = false;
  otpVerifying = false;
  otpSending = false;

  // Forgot Password tab state
  forgotOtpSent = false;
  forgotOtpVerifying = false;
  forgotOtpSending = false;

  showNewPassword = false;
  showConfirmPassword = false;
  showForgotNewPassword = false;
  showForgotConfirmPassword = false;

  userId = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';

    this.passwordForm = this.fb.group(
      {
        email: [{ value: '', disabled: true }],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
          ],
        ],
        confirmPassword: ['', Validators.required],
        otp: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      },
      { validators: [passwordMatchValidator] },
    );

    this.forgotPasswordForm = this.fb.group(
      {
        email: [{ value: '', disabled: true }],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
          ],
        ],
        confirmPassword: ['', Validators.required],
        otp: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      },
      { validators: [passwordMatchValidator] },
    );

    this.loadUser();
  }

  loadUser(): void {
    this.apiService.getUserInfo<any>(this.userId).subscribe({
      next: (res) => {
        const user = res.data;
        this.passwordForm.patchValue({ email: user.email ?? '' });
        this.forgotPasswordForm.patchValue({ email: user.email ?? '' });
      },
      error: () => {
        this.toastr.error('Unable to fetch user information');
      },
    });
  }

  setActiveTab(index: number): void {
    this.activeTab = index;
  }

  // ---------- Field-level error helpers (per active tab) ----------
  private get activeForm(): FormGroup {
    return this.activeTab === 0 ? this.passwordForm : this.forgotPasswordForm;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.activeForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getError(field: string): string {
    const ctrl = this.activeForm.get(field);
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required'])
      return `${this.fieldLabel(field)} is required.`;
    if (ctrl.errors['minlength'])
      return 'Password must be at least 8 characters.';
    if (ctrl.errors['email']) return 'Enter a valid email address.';
    if (ctrl.errors['pattern']) {
      if (field === 'otp') return 'Enter a valid 5-digit OTP.';
      return 'Password must contain an uppercase letter, a number, and a special character.';
    }
    return 'Invalid value.';
  }

  get passwordMismatch(): boolean {
    return (
      this.activeTab === 0 &&
      !!this.passwordForm.errors?.['passwordMismatch'] &&
      this.passwordForm.get('confirmPassword')?.touched === true
    );
  }

  get forgotPasswordMismatch(): boolean {
    return (
      this.activeTab === 1 &&
      !!this.forgotPasswordForm.errors?.['passwordMismatch'] &&
      this.forgotPasswordForm.get('confirmPassword')?.touched === true
    );
  }

  fieldLabel(field: string): string {
    const map: Record<string, string> = {
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      email: 'Email ID',
      otp: 'OTP',
    };
    return map[field] || field;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  toggleForgotNewPasswordVisibility(): void {
    this.showForgotNewPassword = !this.showForgotNewPassword;
  }
  toggleForgotConfirmPasswordVisibility(): void {
    this.showForgotConfirmPassword = !this.showForgotConfirmPassword;
  }

  // ---------- Change Password tab ----------
  sendOtp(): void {
    if (this.otpSending || this.otpSent) return;
    this.otpSending = true;
    const payload = { login_field: this.passwordForm.getRawValue().email };

    this.apiService.sendPasswordOtp(payload).subscribe({
      next: () => {
        this.otpSent = true;
        this.toastr.success('OTP sent successfully');
        this.otpSending = false;
      },
      error: () => {
        this.toastr.error('Unable to send OTP');
        this.otpSending = false;
      },
    });
  }

  verifyOtp(): void {
    this.passwordForm.get('newPassword')?.markAsTouched();
    this.passwordForm.get('confirmPassword')?.markAsTouched();
    this.passwordForm.get('otp')?.markAsTouched();

    if (
      this.passwordForm.get('newPassword')?.invalid ||
      this.passwordForm.get('confirmPassword')?.invalid ||
      this.passwordForm.get('otp')?.invalid ||
      this.passwordForm.errors?.['passwordMismatch']
    ) {
      return;
    }
    if (this.otpVerifying) return;
    this.otpVerifying = true;

    const raw = this.passwordForm.getRawValue();
    const payload = {
      email: raw.email,
      newPassword: raw.newPassword,
      confirmPassword: raw.confirmPassword,
      otp: raw.otp,
    };

    this.apiService.verifyPasswordOtp(payload).subscribe({
      next: () => {
        this.toastr.success('Password changed successfully');
        this.otpVerifying = false;
        this.resetPassword();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'OTP verification failed');
        this.otpVerifying = false;
      },
    });
  }

  resetPassword(): void {
    const email = this.passwordForm.getRawValue().email;
    this.passwordForm.reset();
    this.passwordForm.patchValue({ email });
    this.otpSent = false;
  }

  // ---------- Forgot Password tab ----------
  sendForgotOtp(): void {
    if (this.forgotOtpSending || this.forgotOtpSent) return;
    this.forgotOtpSending = true;
    const payload = {
      login_field: this.forgotPasswordForm.getRawValue().email,
    };

    this.apiService.sendPasswordOtp(payload).subscribe({
      next: () => {
        this.forgotOtpSent = true;
        this.toastr.success('OTP sent successfully');
        this.forgotOtpSending = false;
      },
      error: () => {
        this.toastr.error('Unable to send OTP');
        this.forgotOtpSending = false;
      },
    });
  }

  verifyForgotOtp(): void {
    this.forgotPasswordForm.get('newPassword')?.markAsTouched();
    this.forgotPasswordForm.get('confirmPassword')?.markAsTouched();
    this.forgotPasswordForm.get('otp')?.markAsTouched();

    if (
      this.forgotPasswordForm.get('newPassword')?.invalid ||
      this.forgotPasswordForm.get('confirmPassword')?.invalid ||
      this.forgotPasswordForm.get('otp')?.invalid ||
      this.forgotPasswordForm.errors?.['passwordMismatch']
    ) {
      return;
    }
    if (this.forgotOtpVerifying) return;
    this.forgotOtpVerifying = true;

    const raw = this.forgotPasswordForm.getRawValue();
    const payload = {
      email: raw.email,
      newPassword: raw.newPassword,
      confirmPassword: raw.confirmPassword,
      otp: raw.otp,
    };

    this.apiService.verifyPasswordOtp(payload).subscribe({
      next: () => {
        this.toastr.success('Password reset successfully');
        this.forgotOtpVerifying = false;
        this.resetForgotPassword();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'OTP verification failed');
        this.forgotOtpVerifying = false;
      },
    });
  }

  resetForgotPassword(): void {
    const email = this.forgotPasswordForm.getRawValue().email;
    this.forgotPasswordForm.reset();
    this.forgotPasswordForm.patchValue({ email });
    this.forgotOtpSent = false;
  }
}
