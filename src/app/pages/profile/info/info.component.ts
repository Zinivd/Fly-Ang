import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from '../../../service/api-service.service';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
})
export class InfoComponent implements OnInit {
  infoForm!: FormGroup;
  userId: string = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';

    this.infoForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      // phone: [
      //   '',
      //   [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)],
      // ],
      // dob: [''],
      // gender: ['']
    });

    this.getUserInfo();
  }

  // Get User Info
  getUserInfo(): void {
    if (!this.userId) {
      this.toastr.error('User ID not found');
      return;
    }

    this.isLoading = true;

    this.apiService.getUserInfo<any>(this.userId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log(res);
        const user = res.data || res.user || res;
        this.infoForm.patchValue({
          fullName: user.name || '',
          email: user.email || '',
          // phone: user.phone || '',
          // dob: user.dob || '',
          // gender: user.gender || '',
        });
      },

      error: (err) => {
        this.isLoading = false;
        console.log(err);
        this.toastr.error('Unable to fetch profile');
      },
    });
  }

  // Save Profile
  saveInfo(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    const payload: any = {
      name: this.infoForm.value.fullName,
    };

    this.apiService.updateProfile<any>(this.userId, payload).subscribe({
      next: (res) => {
        console.log(res);
        this.toastr.success('Profile updated successfully');

        this.getUserInfo();
      },
      error: (err) => {
        console.log(err);
        this.toastr.error('Profile update failed');
      },
    });
  }

  // Reset
  resetInfo(): void {
    this.infoForm.reset();
    this.getUserInfo();
  }

  // Validation Helpers
  isInvalid(field: string): boolean {
    const ctrl = this.infoForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getError(field: string): string {
    const ctrl = this.infoForm.get(field);

    if (!ctrl || !ctrl.errors || !ctrl.touched) {
      return '';
    }

    if (ctrl.errors['required']) {
      return `${this.fieldLabel(field)} is required.`;
    }

    if (ctrl.errors['minlength']) {
      return `${this.fieldLabel(field)} is too short.`;
    }

    if (ctrl.errors['email']) {
      return 'Enter a valid email address.';
    }

    if (ctrl.errors['pattern']) {
      if (field === 'phone') {
        return 'Enter a valid mobile number.';
      }
    }

    return 'Invalid value.';
  }

  fieldLabel(field: string): string {
    const map: Record<string, string> = {
      fullName: 'Full Name',
      email: 'Email ID',
      // phone: 'Mobile Number',
      // dob: 'Date of Birth',
      // gender: 'Gender',
    };

    return map[field] || field;
  }
}
