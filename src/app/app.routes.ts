import { Routes } from '@angular/router';

// Portal
import { LoginComponent } from './pages/portal/login/login.component';
import { OtpComponent } from './pages/portal/otp/otp.component';
import { SuccessComponent } from './pages/portal/success/success.component';

// Layout
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { AllProductsComponent } from './pages/all-products/all-products.component';

export const routes: Routes = [
  // Pages
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'product-details/:id', component: ProductDetailsComponent },
      { path: 'all-products', component: AllProductsComponent },
    ],
  },
  // Portal
  { path: 'login', component: LoginComponent },
  { path: 'otp', component: OtpComponent },
  { path: 'success', component: SuccessComponent },
];
