import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { BaseUrlService } from '../../../service/base-url.service';

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
  currentStep: number = 1;
  selectedPaymentId: number = -1;
  showCardForm: boolean = false;
  loading = true;

  orderId: string | null = null;

  paymentMethods: PaymentMethod[] = [
    {
      id: 1,
      label: 'Razorpay',
      name: 'Pay via UPI (GPay, PhonePe, Paytm)',
      isDefault: true,
    },
  ];

  cardForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiServiceService,
    private toastr: ToastrService,
    public checkout: CheckoutService,
    public baseUrl: BaseUrlService,
  ) {}

  ngOnInit(): void {
    this.initCardForm();

    const defaultMethod = this.paymentMethods.find((p) => p.isDefault);
    if (defaultMethod) this.selectedPaymentId = defaultMethod.id;

    this.route.queryParamMap.subscribe((params) => {
      this.orderId = params.get('orderId');
      if (!this.orderId) {
        this.toastr.error('No order found. Please start checkout again.');
      }
    });
  }

  initCardForm(): void {
    this.loading = false;
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

  get isCardMethod(): boolean {
    const selected = this.paymentMethods.find(
      (p) => p.id === this.selectedPaymentId,
    );
    return selected?.label === 'Debit / Credit Card';
  }

  selectPayment(id: number): void {
    this.selectedPaymentId = id;
    this.showCardForm = this.isCardMethod;
    if (!this.showCardForm) {
      this.cardForm.reset();
    }
  }

  proceedToReview(): void {
    const selected = this.paymentMethods.find(
      (p) => p.id === this.selectedPaymentId,
    );
    if (!selected) return;
    if (!this.orderId) {
      this.toastr.error('No order found. Please start checkout again.');
      return;
    }

    if (selected.label === 'Cash On Delivery') {
      this.router.navigate(['/review'], {
        queryParams: { orderId: this.orderId, status: 'success' },
      });
      return;
    }

    this.payWithRazorpay();
  }

  payWithRazorpay(): void {
    const url = `${this.baseUrl.getAPIURL()}/payment/create-order`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: this.total,
        currency: 'INR',
        order_table_id: this.orderId, // FIXED: key must match backend's 'order_table_id'
      }),
    })
      .then((res) => res.json())
      .then((response) => {
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
              contact: '9999999999',
            },
            theme: { color: '#c4b5fd' },
          };
          const rzp = new Razorpay(options);
          rzp.on('payment.failed', (failedResponse: any) => {
            this.toastr.error(
              'Payment Failed: ' + failedResponse.error.description,
            );
            this.router.navigate(['/review'], {
              queryParams: { orderId: this.orderId, status: 'failed' },
            });
          });
          rzp.open();
        } else {
          this.toastr.error(
            'Failed to initiate payment: ' +
              (response.message || 'Unknown error'),
          );
        }
      })
      .catch((err) => {
        console.error(err);
        this.toastr.error('Error connecting to backend payment service.');
      });
  }


  verifyPayment(paymentResponse: any): void {
    this.api
      .verifyPayment<any>({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        order_table_id: this.orderId, // FIXED: fallback link, in case create-order's link didn't take
      })
      .subscribe({
        next: (response) => {
          const success = response?.status === 'success' && response?.data?.payment_status === 'Paid';
          if (!success) {
            this.toastr.warning('Payment verified but order could not be confirmed as Paid.');
          }
          this.router.navigate(['/review'], {
            queryParams: {
              orderId: this.orderId,
              status: success ? 'success' : 'failed',
            },
          });
        },
        error: () => {
          this.router.navigate(['/review'], {
            queryParams: { orderId: this.orderId, status: 'failed' },
          });
        },
      });
  }

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
