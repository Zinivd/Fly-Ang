import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseUrlService {

  constructor() { }

  
  public getAPIURL(): string {
    // return 'https://backend-dev.flybirdsleggings.com/api';
    // return 'http://127.0.0.1:8000/api';
    return 'http://10.66.81.191:8000/api';
    // return 'https://selene-overconstant-albertina.ngrok-free.dev/api';
  }

  public getAPIURLdownload(): string {
    return 'https://backend-dev.flybirdsleggings.com/';
  }
}
