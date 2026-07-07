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

declare var Razorpay: any;

export interface PaymentMethod {
  id: number;
  label: string;
  name: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-payment',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  // Stepper
  currentStep: number = 1;

  // Payment method selection
  selectedPaymentId: number = -1;

  // Form visibility
  showCardForm: boolean = false;

  // Saved payment methods
  paymentMethods: PaymentMethod[] = [
    {
      id: 1,
      label: 'UPI',
      name: 'Pay via UPI (GPay, PhonePe, Paytm)',
      isDefault: true,
    },
    {
      id: 2,
      label: 'Debit / Credit Card',
      name: 'Visa, MasterCard, RuPay',
      isDefault: false,
    },
    {
      id: 3,
      label: 'Net Banking',
      name: 'All major banks supported',
      isDefault: false,
    },
    {
      id: 4,
      label: 'Cash On Delivery',
      name: 'Pay when you receive',
      isDefault: false,
    },
  ];

  // Order Summary
  orderSummary = {
    items: [
      {
        name: 'Bottle Green Ankle Leggings',
        qty: 1,
        price: 499,
        image: 'assets/images/Products/1.png',
      },
      {
        name: 'Classic Black Sports Bra',
        qty: 2,
        price: 349,
        image: 'assets/images/Products/2.png',
      },
      {
        name: 'Navy Blue Yoga Pants',
        qty: 1,
        price: 599,
        image: 'assets/images/Products/3.png',
      },
    ],
    discount: 0,
    shipping: 49,
    taxRate: 0.18,
  };

  // Card Form
  cardForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initCardForm();
    // Select default payment method
    const defaultMethod = this.paymentMethods.find((p) => p.isDefault);
    if (defaultMethod) this.selectedPaymentId = defaultMethod.id;
  }

  initCardForm(): void {
    this.cardForm = this.fb.group({
      cardNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/),
        ],
      ],
      expiry: [
        '',
        [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)],
      ],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });
  }

  // Computed order values
  get subtotal(): number {
    return this.orderSummary.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  get discountAmount(): number {
    return this.orderSummary.discount;
  }

  get shippingCharge(): number {
    return this.subtotal - this.discountAmount >= 999
      ? 0
      : this.orderSummary.shipping;
  }

  get taxAmount(): number {
    return Math.round(
      (this.subtotal - this.discountAmount) * this.orderSummary.taxRate,
    );
  }

  get total(): number {
    return (
      this.subtotal - this.discountAmount + this.shippingCharge + this.taxAmount
    );
  }

  get totalItems(): number {
    return this.orderSummary.items.reduce((sum, i) => sum + i.qty, 0);
  }

  // Whether the selected payment method requires card details
  get isCardMethod(): boolean {
    const selected = this.paymentMethods.find(
      (p) => p.id === this.selectedPaymentId,
    );
    return selected?.label === 'Debit / Credit Card';
  }

  // Payment method selection
  selectPayment(id: number): void {
    this.selectedPaymentId = id;
    // Show card form only when card method is selected
    this.showCardForm = this.isCardMethod;
    if (!this.showCardForm) {
      this.cardForm.reset();
    }
  }

  // Proceed to review step
  proceedToReview(): void {
    const selected = this.paymentMethods.find(
      (p) => p.id === this.selectedPaymentId,
    );
    if (!selected) return;

    if (selected.label === 'Cash On Delivery') {
      this.router.navigate(['/success']);
      return;
    }

    // Trigger Razorpay payment gateway
    this.payWithRazorpay();
  }

  payWithRazorpay(): void {
    // 1. Call Backend to create Razorpay Order
    fetch('http://localhost:8000/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: this.total,
        currency: 'INR'
      })
    })
    .then(res => res.json())
    .then(response => {
      if (response.status === 'success') {
        const options = {
          key: response.data.key_id,
          amount: response.data.amount,
          currency: response.data.currency,
          name: 'Flybirds Leggings',
          description: 'Payment for your order',
          image: 'assets/images/logo.png',
          order_id: response.data.razorpay_order_id,
          handler: (paymentResponse: any) => {
            this.verifyPayment(paymentResponse);
          },
          prefill: {
            name: 'Customer Name',
            email: 'customer@example.com',
            contact: '9999999999'
          },
          theme: {
            color: '#c4b5fd' // Sleek purple accent matching FLY-BIRDS theme
          }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (failedResponse: any) => {
          alert('Payment Failed: ' + failedResponse.error.description);
        });
        rzp.open();
      } else {
        alert('Failed to initiate payment: ' + (response.message || 'Unknown error'));
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error connecting to backend payment service.');
    });
  }

  verifyPayment(paymentResponse: any): void {
    fetch('http://localhost:8000/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature
      })
    })
    .then(res => res.json())
    .then(response => {
      if (response.status === 'success') {
        alert('Payment Successful!');
        this.router.navigate(['/success']);
      } else {
        alert('Payment verification failed: ' + response.message);
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error verifying payment.');
    });
  }

  // Form field helpers
  isInvalid(field: string): boolean {
    const ctrl = this.cardForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getError(field: string): string {
    const ctrl = this.cardForm.get(field);
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required'])
      return `${this.fieldLabel(field)} is required.`;
    if (ctrl.errors['pattern']) {
      if (field === 'cardNumber') return 'Enter a valid 16-digit card number.';
      if (field === 'expiry') return 'Enter a valid expiry date (MM/YY).';
      if (field === 'cvv') return 'CVV must be 3 or 4 digits.';
    }
    return 'Invalid value.';
  }

  fieldLabel(field: string): string {
    const map: Record<string, string> = {
      cardNumber: 'Card Number',
      expiry: 'Expiry Date',
      cvv: 'CVV',
    };
    return map[field] || field;
  }
}
