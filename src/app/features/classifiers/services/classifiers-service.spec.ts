import { TestBed } from '@angular/core/testing';

import { ClassifiersService } from './classifiers-service';

describe('ClassifiersService', () => {
  let service: ClassifiersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassifiersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
