import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

export interface Address {
  id: number;
  label: string;
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

@Component({
  selector: 'app-address',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css',
})
export class AddressComponent {
  // Address selection
  selectedAddressId: number = 1;

  // Form visibility
  showAddressForm: boolean = false;
  editingAddressId: number | null = null;

  // Pincode delivery status
  pincodeStatus: 'available' | 'unavailable' | null = null;
  pincodeChecking: boolean = false;

  // Saved addresses
  addresses: Address[] = [
    {
      id: 1,
      label: 'Home',
      name: 'Sheik',
      mobile: '+91-1234567890',
      addressLine1: '6/408, Kel Easalpatti (Vi)',
      addressLine2: 'Mel Easalpatti (P.o) Maniyathahalli',
      city: 'Dharmapuri',
      state: 'Tamil Nadu',
      pincode: '636807',
      type: 'Home',
      isDefault: true,
    },
    {
      id: 2,
      label: 'Work',
      name: 'Sheik',
      mobile: '+91-9876543210',
      addressLine1: '12, Industrial Estate',
      addressLine2: 'Avinashi Road',
      city: 'Tiruppur',
      state: 'Tamil Nadu',
      pincode: '641603',
      type: 'Work',
      isDefault: false,
    },
  ];

  addressForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm();
    // Select default address by default
    const defaultAddr = this.addresses.find((a) => a.isDefault);
    if (defaultAddr) this.selectedAddressId = defaultAddr.id;
  }

  initForm(address?: Address): void {
    this.addressForm = this.fb.group({
      name: [
        address?.name || '',
        [Validators.required, Validators.minLength(2)],
      ],
      mobile: [
        address?.mobile || '',
        [Validators.required, Validators.pattern(/^\+?[0-9\-]{10,15}$/)],
      ],
      addressLine1: [address?.addressLine1 || '', Validators.required],
      addressLine2: [address?.addressLine2 || ''],
      city: [address?.city || '', Validators.required],
      state: [address?.state || '', Validators.required],
      pincode: [
        address?.pincode || '',
        [Validators.required, Validators.pattern(/^[0-9]{6}$/)],
      ],
      type: [address?.type || 'Home', Validators.required],
      isDefault: [address?.isDefault || false],
    });

    // Watch pincode changes
    this.addressForm.get('pincode')?.valueChanges.subscribe((val) => {
      if (val?.length === 6) {
        this.checkPincodeDelivery(val);
      } else {
        this.pincodeStatus = null;
      }
    });
  }

  checkPincodeDelivery(pincode: string): void {
    this.pincodeChecking = true;
    this.pincodeStatus = null;
    // Simulated check — replace with real API
    setTimeout(() => {
      const serviceablePincodes = [
        '636807',
        '641603',
        '641001',
        '600001',
        '560001',
      ];
      this.pincodeStatus = serviceablePincodes.includes(pincode)
        ? 'available'
        : 'unavailable';
      this.pincodeChecking = false;
    }, 600);
  }

  // Address actions
  selectAddress(id: number): void {
    this.selectedAddressId = id;
  }

  setDefault(id: number): void {
    this.addresses = this.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
  }

  editAddress(address: Address): void {
    this.editingAddressId = address.id;
    this.showAddressForm = true;
    this.initForm(address);
  }

  deleteAddress(id: number): void {
    this.addresses = this.addresses.filter((a) => a.id !== id);
    if (this.selectedAddressId === id) {
      const def = this.addresses.find((a) => a.isDefault) || this.addresses[0];
      this.selectedAddressId = def?.id ?? -1;
    }
  }

  toggleForm(): void {
    this.showAddressForm = !this.showAddressForm;
    if (this.showAddressForm) {
      this.editingAddressId = null;
      this.initForm();
    }
  }

  cancelForm(): void {
    this.showAddressForm = false;
    this.editingAddressId = null;
    this.pincodeStatus = null;
    this.initForm();
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const val = this.addressForm.value;

    if (val.isDefault) {
      this.addresses = this.addresses.map((a) => ({ ...a, isDefault: false }));
    }

    if (this.editingAddressId !== null) {
      // Update existing
      this.addresses = this.addresses.map((a) =>
        a.id === this.editingAddressId ? { ...a, ...val, label: val.type } : a,
      );
      this.selectedAddressId = this.editingAddressId;
    } else {
      // Add new
      const newId = Math.max(0, ...this.addresses.map((a) => a.id)) + 1;
      const newAddress: Address = {
        id: newId,
        label: val.type,
        ...val,
      };
      this.addresses.push(newAddress);
      this.selectedAddressId = newId;
    }

    this.cancelForm();
  }

  // Form field helpers
  isInvalid(field: string): boolean {
    const ctrl = this.addressForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getError(field: string): string {
    const ctrl = this.addressForm.get(field);
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required'])
      return `${this.fieldLabel(field)} is required.`;
    if (ctrl.errors['minlength'])
      return `${this.fieldLabel(field)} is too short.`;
    if (ctrl.errors['pattern']) {
      if (field === 'mobile') return 'Enter a valid mobile number.';
      if (field === 'pincode') return 'Pincode must be 6 digits.';
    }
    return 'Invalid value.';
  }

  fieldLabel(field: string): string {
    const map: Record<string, string> = {
      name: 'Name',
      mobile: 'Phone',
      addressLine1: 'Address Line 1',
      city: 'City',
      state: 'State',
      pincode: 'Pincode',
    };
    return map[field] || field;
  }
}
