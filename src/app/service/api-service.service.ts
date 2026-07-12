import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BaseUrlService } from './base-url.service';
import { UrlHelpersService } from './url-helpers.service';

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  private readonly http: HttpClient = inject(HttpClient);

  constructor(
    private urlHelper: BaseUrlService,
    private envUrl: UrlHelpersService,
    private router: Router,
  ) {}

  // Use for authenticated endpoints (attaches Bearer token if present)
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  // Use for public/unauthenticated endpoints (register, otp, login)
  // Never attaches a stale/leftover Authorization token.
  private getPublicHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420',
    });
  }

  private getHeadersforFormdata(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'ngrok-skip-browser-warning': '69420',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  private handleAuthErrors(error: any): void {
    if (error.status === 403) {
      sessionStorage.clear();
      localStorage.clear();
      this.router.navigate(['/auth/sign-in']);
      return;
    }
    if (
      error?.error?.success === false &&
      error?.error?.message === 'Session expired'
    ) {
      this.router.navigate(['/auth/sign-in']);
    }
  }

  public loginwithEmail<T>(payload: any): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.loginwithEmail}`;

    return this.http
      .post<T>(serviceURL, payload, { headers: this.getPublicHeaders() })
      .pipe(
        catchError((error) => {
          return throwError(() => ({
            statusCode: 500,
            message: 'Login API error',
            error,
          }));
        }),
      );
  }

  public loginOtp<T>(payload: any): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.loginOtp}`;

    return this.http
      .post<T>(serviceURL, payload, { headers: this.getPublicHeaders() })
      .pipe(
        catchError((error) => {
          return throwError(() => ({
            statusCode: 500,
            message: 'Login OTP API error',
            error,
          }));
        }),
      );
  }

  // Login via OTP - verify
  public loginOtpVerify<T>(payload: any): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.loginOtpVerify}`;

    return this.http
      .post<T>(serviceURL, payload, { headers: this.getPublicHeaders() })
      .pipe(
        catchError((error) => {
          return throwError(() => ({
            statusCode: 500,
            message: 'Login OTP Verify API error',
            error,
          }));
        }),
      );
  }

  // Auth - Register
  public register<T>(payload: any): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.register}`;

    return this.http
      .post<T>(serviceURL, payload, { headers: this.getPublicHeaders() })
      .pipe(
        catchError((error) => {
          return throwError(() => ({
            statusCode: 500,
            message: 'Register API error',
            error,
          }));
        }),
      );
  }

  // Auth - Verify OTP
  public verifyOtp<T>(payload: any): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.otp}`;

    return this.http
      .post<T>(serviceURL, payload, { headers: this.getPublicHeaders() })
      .pipe(
        catchError((error) => {
          return throwError(() => ({
            statusCode: 500,
            message: 'Verify OTP API error',
            error,
          }));
        }),
      );
  }

  // Get User Info
  public getUserInfo<T>(userId: string): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.userInfo}/${userId}`;

    return this.http
      .get<T>(serviceURL, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          this.handleAuthErrors(error);
          return throwError(() => ({
            statusCode: 500,
            message: 'Get User Info API error',
            error,
          }));
        }),
      );
  }

  // Update Profile
  public updateProfile<T>(userId: string, payload: any): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.updateProfile}/${userId}`;

    return this.http
      .put<T>(serviceURL, payload, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          this.handleAuthErrors(error);
          return throwError(() => ({
            statusCode: 500,
            message: 'Update Profile API error',
            error,
          }));
        }),
      );
  }

  public sendPasswordOtp<T>(payload: any): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.setPassword}`;

    return this.http
      .post<T>(serviceURL, payload, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          this.handleAuthErrors(error);
          return throwError(() => ({
            statusCode: 500,
            message: 'Send Password OTP API error',
            error,
          }));
        }),
      );
  }

  // Verify Password OTP
  public verifyPasswordOtp<T>(payload: any): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.verifyOtpPassword}`;

    return this.http
      .post<T>(serviceURL, payload, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          this.handleAuthErrors(error);
          return throwError(() => ({
            statusCode: 500,
            message: 'Verify Password OTP API error',
            error,
          }));
        }),
      );
  }

  // Banners
  public getBanners<T>(): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.banners}`;

    return this.http.get<T>(url, {
      headers: this.getHeaders(),
    });
  }

  // Categories
  public getCategoryList<T>(): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.categoryList}`;

    return this.http.get<T>(serviceURL, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Category List API error',
          error,
        }));
      }),
    );
  }

  // Get Colors
  public getColors<T>() {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.colorsList}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
    });
  }

  // Get Products
  public getProducts<T>(params: Record<string, any>): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.productsList}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      params,
    });
  }

  getProductById<T>(id: number): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.productsList}/${id}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      params: { id },
    });
  }

  //reel
  public getreelList<T>(): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.reelList}?is_published=true`;

    return this.http.get<T>(serviceURL, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Reel List API error',
          error,
        }));
      }),
    );
  }

  // Wishlist - Add
  public addToWishlist<T>(
    userId: string | number,
    payload: any,
  ): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.wishlistUsersBase}/${userId}/wishlist`;

    return this.http
      .post<T>(serviceURL, payload, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleAuthErrors(error);
          return throwError(() => ({
            statusCode: 500,
            message: 'Add To Wishlist API error',
            error,
          }));
        }),
      );
  }

  // Wishlist - List
  public getWishlist<T>(userId: string | number): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.wishlistUsersBase}/${userId}/wishlist`;

    return this.http.get<T>(serviceURL, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Wishlist API error',
          error,
        }));
      }),
    );
  }

  // Wishlist - Remove by product id
  public removeFromWishlist<T>(
    userId: string | number,
    productId: string | number,
  ): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.wishlistUsersBase}/${userId}/wishlist/product/${productId}`;

    return this.http.delete<T>(serviceURL, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Remove From Wishlist API error',
          error,
        }));
      }),
    );
  }

  // Cart - Add
  public addToCart<T>(userId: string | number, payload: any): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.cartBase}/${userId}/cart`;

    return this.http
      .post<T>(serviceURL, payload, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleAuthErrors(error);
          return throwError(() => ({
            statusCode: 500,
            message: 'Add To Cart API error',
            error,
          }));
        }),
      );
  }

  // Cart - List
  public getCart<T>(userId: string | number): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.cartBase}/${userId}/cart`;

    return this.http.get<T>(serviceURL, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Cart API error',
          error,
        }));
      }),
    );
  }

  // Cart - Update quantity
  public updateCartItem<T>(
    userId: string | number,
    cartId: string | number,
    payload: any,
  ): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.cartBase}/${userId}/cart/${cartId}`;

    return this.http
      .patch<T>(serviceURL, payload, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleAuthErrors(error);
          return throwError(() => ({
            statusCode: 500,
            message: 'Update Cart Item API error',
            error,
          }));
        }),
      );
  }

  // Cart - Remove
  public removeCartItem<T>(
    userId: string | number,
    cartId: string | number,
  ): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.cartBase}/${userId}/cart/${cartId}`;

    return this.http.delete<T>(serviceURL, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Remove Cart Item API error',
          error,
        }));
      }),
    );
  }

  // Address - Add
  public addAddress<T>(userId: string | number, payload: any): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.addressUsersBase}/${userId}/addresses`;

    return this.http
      .post<T>(serviceURL, payload, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleAuthErrors(error);
          return throwError(() => ({
            statusCode: 500,
            message: 'Add Address API error',
            error,
          }));
        }),
      );
  }

  // Address - Get all by user id (optionally filter by type: Home/Work/Other)
  public getAddresses<T>(
    userId: string | number,
    type?: string,
  ): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.addressUsersBase}/${userId}/addresses`;
    // const params = type ? { type } : {};

    return this.http.get<T>(serviceURL, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Addresses API error',
          error,
        }));
      }),
    );
  }

  // Address - Get single
  public getAddressById<T>(
    userId: string | number,
    addressId: string | number,
  ): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.addressUsersBase}/${userId}/addresses/${addressId}`;

    return this.http.get<T>(serviceURL, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Address API error',
          error,
        }));
      }),
    );
  }

  // Address - Update
  public updateAddress<T>(
    userId: string | number,
    addressId: string | number,
    payload: any,
  ): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.addressUsersBase}/${userId}/addresses/${addressId}`;

    return this.http
      .patch<T>(serviceURL, payload, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleAuthErrors(error);
          return throwError(() => ({
            statusCode: 500,
            message: 'Update Address API error',
            error,
          }));
        }),
      );
  }

  // Address - Delete
  public deleteAddress<T>(
    userId: string | number,
    addressId: string | number,
  ): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.addressUsersBase}/${userId}/addresses/${addressId}`;

    return this.http.delete<T>(serviceURL, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Delete Address API error',
          error,
        }));
      }),
    );
  }

  // Best Sellers
  public getBestSellers<T>(): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.bestSellers}`;
    return this.http.get<T>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Best Sellers API error',
          error,
        }));
      }),
    );
  }

  // Collections
  public getCollections<T>(): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.collections}`;
    return this.http.get<T>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Collections API error',
          error,
        }));
      }),
    );
  }

  // Orders - Create (checkout)
  public createOrder<T>(payload: any): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.createOrder}`;
    return this.http.post<T>(url, payload, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Create Order API error',
          error,
        }));
      }),
    );
  }

  // Orders - Get by id
  public getOrderById<T>(orderId: string | number): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.orderDetails}/${orderId}`;
    return this.http.get<T>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Order By Id API error',
          error,
        }));
      }),
    );
  }

  // Payment - Verify
  public verifyPayment<T>(payload: any): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.paymentVerify}`;
    return this.http.post<T>(url, payload, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Verify Payment API error',
          error,
        }));
      }),
    );
  }

  // Orders - Get all by user id
  public getOrdersByUser<T>(userId: string | number): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.ordersByUser}/${userId}/orders`;
    return this.http.get<T>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Orders By User API error',
          error,
        }));
      }),
    );
  }

  // Recently Viewed - Add
  public addRecentlyViewed<T>(payload: any): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.recentlyViewedAdd}`;
    return this.http.post<T>(url, payload, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Add Recently Viewed API error',
          error,
        }));
      }),
    );
  }

  // Recently Viewed - List
  public getRecentlyViewed<T>(userId: string | number): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.recentlyViewedList}/${userId}`;
    return this.http.get<T>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Recently Viewed API error',
          error,
        }));
      }),
    );
  }

  // Reviews - Create
  public createReview<T>(payload: any): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.reviewsCreate}`;
    return this.http.post<T>(url, payload, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Create Review API error',
          error,
        }));
      }),
    );
  }

  // Reviews - By product (with rating summary)
  public getReviewsByProduct<T>(productId: number | string): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.reviewsByProduct}/${productId}/reviews`;
    return this.http.get<T>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Reviews By Product API error',
          error,
        }));
      }),
    );
  }

  // Similar Products
  public getSimilarProducts<T>(productId: number | string): Observable<T> {
    const url = `${this.urlHelper.getAPIURL()}${this.envUrl.similarProducts}/${productId}/similar`;
    return this.http.get<T>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Get Similar Products API error',
          error,
        }));
      }),
    );
  }
}
