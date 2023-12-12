import { TestBed } from '@angular/core/testing';

import { SelectCompanyService } from './select-company.service';

describe('SelectCompanyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SelectCompanyService = TestBed.get(SelectCompanyService);
    expect(service).toBeTruthy();
  });
});
