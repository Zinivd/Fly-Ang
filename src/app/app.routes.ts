import { Routes } from '@angular/router';

// Portal
import { RegisterComponent } from './pages/portal/register/register.component';
import { LoginComponent } from './pages/portal/login/login.component';
import { OtpComponent } from './pages/portal/otp/otp.component';
import { SuccessComponent } from './pages/portal/success/success.component';

// Layout
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { AllProductsComponent } from './pages/all-products/all-products.component';
import { CartComponent } from './pages/cart/cart.component';
import { AddressComponent } from './pages/checkout/address/address.component';
import { PaymentComponent } from './pages/checkout/payment/payment.component';
import { ReviewComponent } from './pages/checkout/review/review.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  // Pages
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'product-details/:id', component: ProductDetailsComponent },
      { path: 'all-products/:categoryName/:categoryId', component: AllProductsComponent },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: AddressComponent },
      { path: 'payment', component: PaymentComponent },
      { path: 'review', component: ReviewComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
  // Portal
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'otp', component: OtpComponent },
  { path: 'success', component: SuccessComponent },
];
