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
import { ApiServiceService } from '../../../service/api-service.service'; // adjust path
import { ToastrService } from 'ngx-toastr';

export interface Address {
  id: number | string;
  label: string;
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

@Component({
  selector: 'app-address',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css',
})
export class AddressComponent implements OnInit {
  // Address selection
  selectedAddressId: number | string = -1;

  // Form visibility
  showAddressForm: boolean = false;
  editingAddressId: number | string | null = null;

  // Loading / error state
  loading: boolean = true;
  saving: boolean = false;

  // Saved addresses (loaded from API)
  addresses: Address[] = [];

  addressForm!: FormGroup;

  // TODO: replace with however you actually read the logged-in user's id
  private get userId(): string {
    return localStorage.getItem('userId') || '';
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ApiServiceService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAddresses();
  }

  loadAddresses(): void {
    if (!this.userId) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.api.getAddresses<any>(this.userId).subscribe({
      next: (res) => {
        const rawList = res?.data || res || [];
        this.addresses = rawList.map((a: any) => this.mapApiAddress(a));
        const defaultAddr = this.addresses.find((a) => a.isDefault);
        this.selectedAddressId = defaultAddr
          ? defaultAddr.id
          : (this.addresses[0]?.id ?? -1);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  // Map backend (snake_case) address object -> frontend Address shape
  private mapApiAddress(a: any): Address {
    return {
      id: a.id,
      label: a.address_type
        ? a.address_type.charAt(0).toUpperCase() + a.address_type.slice(1)
        : 'Home',
      name: a.full_name || '',
      mobile: a.phone || '',
      addressLine1: a.address_line_1 || '',
      addressLine2: a.address_line_2 || '',
      city: a.city || '',
      state: a.state || '',
      pincode: a.postal_code || '',
      country: a.country || '',
      type: (a.address_type
        ? a.address_type.charAt(0).toUpperCase() + a.address_type.slice(1)
        : 'Home') as 'Home' | 'Work' | 'Other',
      isDefault: !!a.is_default,
    };
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
      country: [address?.country || 'India', Validators.required],
      type: [address?.type || 'Home', Validators.required],
      isDefault: [address?.isDefault || false],
    });
  }

  // checkPincodeDelivery(pincode: string): void {
  //   this.pincodeChecking = true;
  //   this.pincodeStatus = null;
  //   // Simulated check — replace with real pincode-serviceability API when available
  //   setTimeout(() => {
  //     const serviceablePincodes = [
  //       '636807',
  //       '641603',
  //       '641001',
  //       '600001',
  //       '560001',
  //     ];
  //     this.pincodeStatus = serviceablePincodes.includes(pincode)
  //       ? 'available'
  //       : 'unavailable';
  //     this.pincodeChecking = false;
  //   }, 600);
  // }

  // Address actions
  selectAddress(id: number | string): void {
    this.selectedAddressId = id;
  }

  setDefault(id: number | string): void {
    this.api
      .updateAddress<any>(this.userId, id, { is_default: true })
      .subscribe({
        next: () => {
          this.loadAddresses();
          this.toastr.success('Default address updated!');
        },
        error: () => {
          this.toastr.error('Could not update default address.');
        },
      });
  }

  editAddress(address: Address): void {
    this.editingAddressId = address.id;
    this.showAddressForm = true;
    this.initForm(address);
  }

  deleteAddress(id: number | string): void {
    this.api.deleteAddress<any>(this.userId, id).subscribe({
      next: () => {
        this.addresses = this.addresses.filter((a) => a.id !== id);
        if (this.selectedAddressId === id) {
          const def =
            this.addresses.find((a) => a.isDefault) || this.addresses[0];
          this.selectedAddressId = def?.id ?? -1;
        }
        this.toastr.success('Address deleted successfully!');
      },
    });
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
    this.initForm();
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const val = this.addressForm.value;

    // Map form fields -> API payload field names (snake_case, per backend contract)
    const payload = {
      address_type: (val.type || 'Home').toLowerCase(),
      full_name: val.name,
      phone: val.mobile,
      address_line_1: val.addressLine1,
      address_line_2: val.addressLine2,
      city: val.city,
      state: val.state,
      postal_code: val.pincode,
      country: val.country,
      is_default: val.isDefault,
    };

    this.saving = true;

    if (this.editingAddressId !== null) {
      this.api
        .updateAddress<any>(this.userId, this.editingAddressId, payload)
        .subscribe({
          next: () => {
            this.saving = false;
            this.loadAddresses();
            this.cancelForm();
            this.toastr.success('Address updated successfully!');
          },
          error: () => {
            this.saving = false;
          },
        });
    } else {
      this.api.addAddress<any>(this.userId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.loadAddresses();
          this.cancelForm();
          this.toastr.success('Address added successfully!');
        },
        error: () => {
          this.saving = false;
        },
      });
    }
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
