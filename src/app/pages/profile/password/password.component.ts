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

// Custom validator: newPassword must not match currentPassword
function newPasswordDifferentValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const current = group.get('currentPassword')?.value;
  const newPwd = group.get('newPassword')?.value;
  if (current && newPwd && current === newPwd) {
    return { sameasCurrent: true };
  }
  return null;
}

// Custom validator: confirmPassword must match newPassword
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

  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: [newPasswordDifferentValidator, passwordMatchValidator],
      },
    );

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  setActiveTab(index: number): void {
    this.activeTab = index;
  }

  // Handles both forms based on active tab
  isInvalid(field: string): boolean {
    const form =
      this.activeTab === 0 ? this.passwordForm : this.forgotPasswordForm;
    const ctrl = form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getError(field: string): string {
    const form =
      this.activeTab === 0 ? this.passwordForm : this.forgotPasswordForm;
    const ctrl = form.get(field);
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required'])
      return `${this.fieldLabel(field)} is required.`;
    if (ctrl.errors['minlength'])
      return 'Password must be at least 8 characters.';
    if (ctrl.errors['email']) return 'Enter a valid email address.';
    if (ctrl.errors['pattern'])
      return 'Password must contain an uppercase letter, a number, and a special character.';
    return 'Invalid value.';
  }

  // Group-level error helpers
  get passwordMismatch(): boolean {
    return (
      this.activeTab === 0 &&
      !!this.passwordForm.errors?.['passwordMismatch'] &&
      this.passwordForm.get('confirmPassword')?.touched === true
    );
  }

  get sameasCurrent(): boolean {
    return (
      this.activeTab === 0 &&
      !!this.passwordForm.errors?.['sameasCurrent'] &&
      this.passwordForm.get('newPassword')?.touched === true
    );
  }

  fieldLabel(field: string): string {
    const map: Record<string, string> = {
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      email: 'Email ID',
    };
    return map[field] || field;
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    console.log('Changing password:', this.passwordForm.value);
    // TODO: call your API/service here
    this.resetPassword();
  }

  resetPassword(): void {
    this.passwordForm.reset();
  }

  sendResetLink(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }
    console.log('Sending reset link to:', this.forgotPasswordForm.value.email);
    // TODO: call your API/service here
    this.forgotPasswordForm.reset();
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
