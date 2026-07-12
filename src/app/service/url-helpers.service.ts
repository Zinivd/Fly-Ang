import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UrlHelpersService {
  constructor() {}

  // Auth
  public loginwithEmail = '/auth/login';
  public loginOtp = '/auth/login';
  public loginOtpVerify = '/auth/login';
  public register = '/auth/register/init';
  public otp = '/auth/register/verify';

  // Profile
  public userInfo = '/auth/user/info';
  public updateProfile = '/auth/profile/update';
  public setPassword = '/auth/forgot-password/send-otp';
  public verifyOtpPassword = '/auth/forgot-password/verify-otp';

  // category
  public categoryList = '/admin/categories';
  public categoryAdd = '/admin/categories';
  public categoryUpdate = '/admin/categories';
  public categoryDelete = '/admin/categories';

  // colors
  public colorsList = '/admin/attributes/colors';

  // products
  public banners = '/banners';
  public productsList = '/admin/products';
  public similarProducts = '/admin/products';

  // wishlist
  public wishlistUsersBase = '/admin/users';

  // cart
  public cartBase = '/admin/users';

  // address
  public addressUsersBase = '/admin/users';

  // create order
  public createOrder = '/orders/checkout';
  public orderDetails = '/orders';
  public paymentVerify = '/payment/verify';
  public ordersByUser = '/users';

  // reels
  public reelList = '/admin/video-reels';

  // best sellers
  public bestSellers = '/admin/home/best-sellers';

  // collections
  public collections = '/admin/home/best-collections';

  // recent viewed
  public recentlyViewedAdd = '/recently-viewed';
  public recentlyViewedList = '/recently-viewed';

  public sentMail = '/orders';

  // reviews
  public reviewsCreate = '/reviews';
  public reviewsByProduct = '/products';
}
