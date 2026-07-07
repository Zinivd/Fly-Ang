import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlHelpersService {

  constructor() { }

    public loginwithEmail = '/auth/login';

    // category
    public categoryList = '/admin/categories';
    public categoryAdd = '/admin/categories';
    public categoryUpdate = '/admin/categories';
    public categoryDelete = '/admin/categories';

    // reels
    public reelList = '/admin/video-reels';
}
