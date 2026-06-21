import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-info',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
})
export class InfoComponent implements OnInit {
  infoForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.infoForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)],
      ],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.infoForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getError(field: string): string {
    const ctrl = this.infoForm.get(field);
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required'])
      return `${this.fieldLabel(field)} is required.`;
    if (ctrl.errors['minlength'])
      return `${this.fieldLabel(field)} is too short.`;
    if (ctrl.errors['email']) return 'Enter a valid email address.';
    if (ctrl.errors['pattern']) {
      if (field === 'phone') return 'Enter a valid mobile number.';
    }
    return 'Invalid value.';
  }

  fieldLabel(field: string): string {
    const map: Record<string, string> = {
      fullName: 'Full Name',
      email: 'Email ID',
      phone: 'Mobile Number',
      dob: 'Date of Birth',
      gender: 'Gender',
    };
    return map[field] || field;
  }

  saveInfo(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }
    console.log('Saving personal info:', this.infoForm.value);
    // TODO: call your API/service here
  }

  resetInfo(): void {
    this.infoForm.reset();
  }
}
