import { TestBed } from '@angular/core/testing';

import { PoliticalDivisionService } from './political-division-service';

describe('PoliticalDivisionService', () => {
  let service: PoliticalDivisionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoliticalDivisionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
