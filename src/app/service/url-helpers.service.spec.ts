import { TestBed } from '@angular/core/testing';

import { UrlHelpersService } from './url-helpers.service';

describe('UrlHelpersService', () => {
  let service: UrlHelpersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlHelpersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
