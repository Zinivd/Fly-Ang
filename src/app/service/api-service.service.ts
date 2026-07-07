import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';
import { BaseUrlService } from './base-url.service';
import { UrlHelpersService } from './url-helpers.service';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

   private readonly http: HttpClient = inject(HttpClient);

  constructor(
    private urlHelper: BaseUrlService,
    private envUrl: UrlHelpersService,
    private router: Router, // ✅ instance injected
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420',
      ...(token && { Authorization: `Bearer ${token}` }),
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
    if (error?.error?.success === false && error?.error?.message === 'Session expired') {
      this.router.navigate(['/auth/sign-in']);
    }
  }

  public loginwithEmail<T>(payload: any): Observable<T> {
    const serviceURL = `${this.urlHelper.getAPIURL()}${this.envUrl.loginwithEmail}`;

    return this.http.post<T>(serviceURL, payload, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        this.handleAuthErrors(error);
        return throwError(() => ({
          statusCode: 500,
          message: 'Login API error',
          error,
        }));
      }),
    );
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
