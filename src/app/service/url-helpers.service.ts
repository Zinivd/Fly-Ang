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

  // reels
  public reelList = '/admin/video-reels';
}
