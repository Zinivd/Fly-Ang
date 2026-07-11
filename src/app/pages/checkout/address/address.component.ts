import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from '../../../service/api-service.service';
import { CheckoutService } from '../../../service/checkout.service';

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
  styleUrls: ['./address.component.css'],
})
export class AddressComponent implements OnInit {
  currentStep = 1;
  selectedAddressId = -1;
  showAddressForm = false;
  editingAddressId: number | null = null;
  loadingAddresses = true;
  saving = false;

  pincodeStatus: 'available' | 'unavailable' | null = null;
  pincodeChecking = false;

  addresses: Address[] = [];
  addressForm!: FormGroup;

  creatingOrder = false;

  customerEmail = '';
  customerName = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ApiServiceService,
    private toastr: ToastrService,
    public checkout: CheckoutService,
  ) {}

  private get userId(): string | null {
    return localStorage.getItem('userId');
  }

  ngOnInit(): void {
    this.initForm();
    this.loadAddresses();
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    if (!this.userId) return;
    this.api.getUserInfo<any>(this.userId).subscribe({
      next: (res) => {
        const user = res?.data ?? res;
        this.customerEmail = user?.email ?? '';
        this.customerName = user?.name ?? user?.full_name ?? '';
      },
      error: () => {
        console.error('Failed to load user info for checkout.');
      },
    });
  }

  // ---------- Address API ----------
  loadAddresses(): void {
    if (!this.userId) {
      this.loadingAddresses = false;
      return;
    }
    this.loadingAddresses = true;
    this.api.getAddresses<any>(this.userId).subscribe({
      next: (res) => {
        const rows = res?.data || [];
        this.addresses = rows.map((row: any) => this.mapAddress(row));
        const def = this.addresses.find((a) => a.isDefault);
        this.selectedAddressId = def?.id ?? this.addresses[0]?.id ?? -1;
        this.loadingAddresses = false;
      },
      error: () => {
        this.loadingAddresses = false;
        this.toastr.error('Failed to load addresses.');
      },
    });
  }

  private mapAddress(row: any): Address {
    const type = this.capitalize(row.address_type) as Address['type'];
    return {
      id: row.id,
      label: type,
      name: row.full_name ?? '',
      mobile: row.phone ?? '',
      addressLine1: row.address_line_1 ?? '',
      addressLine2: row.address_line_2 ?? '',
      city: row.city ?? '',
      state: row.state ?? '',
      pincode: row.postal_code ?? '',
      type,
      isDefault: !!row.is_default,
    };
  }

  private toApiPayload(val: any) {
    return {
      full_name: val.name,
      phone: val.mobile,
      address_line_1: val.addressLine1,
      address_line_2: val.addressLine2 || null,
      city: val.city,
      state: val.state,
      postal_code: val.pincode,
      country: 'India',
      address_type: (val.type as string).toLowerCase(),
      is_default: val.isDefault,
    };
  }

  private capitalize(s: string): string {
    if (!s) return 'Home';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
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

    this.addressForm.get('pincode')?.valueChanges.subscribe((val) => {
      this.pincodeStatus = null;
      if (val?.length === 6) this.checkPincodeDelivery(val);
    });
  }

  checkPincodeDelivery(pincode: string): void {
    this.pincodeChecking = true;
    setTimeout(() => {
      const serviceable = ['636807', '641603', '641001', '600001', '560001'];
      this.pincodeStatus = serviceable.includes(pincode)
        ? 'available'
        : 'unavailable';
      this.pincodeChecking = false;
    }, 600);
  }

  // ---------- Order summary, sourced from cart ----------
  get orderSummary() {
    return (
      this.checkout.orderSummary ?? {
        items: [],
        subtotal: 0,
        discountAmount: 0,
        shippingCharge: 0,
        taxAmount: 0,
        total: 0,
      }
    );
  }
  get subtotal(): number {
    return this.orderSummary.subtotal;
  }
  get discountAmount(): number {
    return this.orderSummary.discountAmount;
  }
  get shippingCharge(): number {
    return this.orderSummary.shippingCharge;
  }
  get taxAmount(): number {
    return this.orderSummary.taxAmount;
  }
  get total(): number {
    return this.orderSummary.total;
  }
  get totalItems(): number {
    return this.orderSummary.items.reduce(
      (sum: number, i: any) => sum + i.qty,
      0,
    );
  }

  // ---------- Address actions ----------
  selectAddress(id: number): void {
    this.selectedAddressId = id;
  }

  setDefault(id: number): void {
    if (!this.userId) return;
    const prev = this.addresses.map((a) => ({ ...a }));
    this.addresses = this.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));

    // No dedicated "set default" endpoint exists in ApiServiceService —
    // reusing updateAddress with is_default: true. Confirm backend
    // actually unsets the previous default on its side.
    this.api.updateAddress(this.userId, id, { is_default: true }).subscribe({
      error: () => {
        this.addresses = prev;
        this.toastr.error('Failed to set default address.');
      },
    });
  }

  editAddress(address: Address): void {
    this.editingAddressId = address.id;
    this.showAddressForm = true;
    this.initForm(address);
  }

  deleteAddress(id: number): void {
    if (!this.userId) return;
    const removed = this.addresses.find((a) => a.id === id);
    this.addresses = this.addresses.filter((a) => a.id !== id);
    if (this.selectedAddressId === id) {
      const def = this.addresses.find((a) => a.isDefault) || this.addresses[0];
      this.selectedAddressId = def?.id ?? -1;
    }

    this.api.deleteAddress(this.userId, id).subscribe({
      next: () => this.toastr.success('Address removed.'),
      error: () => {
        if (removed) this.addresses.push(removed);
        this.toastr.error('Failed to delete address.');
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
    this.pincodeStatus = null;
    this.initForm();
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    if (!this.userId) return;

    const payload = this.toApiPayload(this.addressForm.value);
    this.saving = true;

    const request$ =
      this.editingAddressId !== null
        ? this.api.updateAddress(this.userId, this.editingAddressId, payload)
        : this.api.addAddress(this.userId, payload);

    request$.subscribe({
      next: () => {
        this.toastr.success(
          this.editingAddressId !== null
            ? 'Address updated.'
            : 'Address added.',
        );
        this.saving = false;
        this.loadAddresses();
        this.cancelForm();
      },
      error: () => {
        this.saving = false;
        this.toastr.error('Failed to save address.');
      },
    });
  }

  // ---------- Proceed to payment ----------
  proceedToPayment(): void {
    const selected = this.addresses.find(
      (a) => a.id === this.selectedAddressId,
    );
    if (!selected) {
      this.toastr.error('Please select a delivery address.');
      return;
    }
    if (!this.userId) return;
    if (this.creatingOrder) return;

    const items = this.orderSummary.items;
    if (!items.length) {
      this.toastr.error('Your cart is empty.');
      return;
    }

    const addressString = `${selected.addressLine1}, ${
      selected.addressLine2 ? selected.addressLine2 + ', ' : ''
    }${selected.city}, ${selected.state} - ${selected.pincode}`;

    const payload = {
      user_id: this.userId,
      customer_name:  selected.name || this.customerName,
      customer_email: this.customerEmail,
      customer_phone: selected.mobile,
      seller_name: 'Flybirds Store',
      payment_method: 'razorpay',
      shipping_address: addressString,
      billing_address: addressString,
      discount: this.discountAmount,
      shipping_charge: this.shippingCharge,
      tax: this.taxAmount,
      items: items.map((i: any) => ({
        product_id: i.productId,
        product_color_variant_id: i.productColorVariantId,
        product_size_stock_id: i.productSizeStockId,
        quantity: i.qty,
      })),
    };

    this.creatingOrder = true;
    this.api.createOrder<any>(payload).subscribe({
      next: (res) => {
        this.creatingOrder = false;
        const orderId = res?.data?.id ?? res?.data?.order_id;
        if (!orderId) {
          this.toastr.error('Order created but no order ID was returned.');
          return;
        }
        this.checkout.setAddress(selected);
        this.router.navigate(['/payment'], { queryParams: { orderId } });
      },
      error: () => {
        this.creatingOrder = false;
        this.toastr.error('Failed to create order. Please try again.');
      },
    });
  }

  // ---------- Form helpers (unchanged) ----------
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
