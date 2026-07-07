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
  public getProducts<T>(params: any) {
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
}
