import { TestBed } from '@angular/core/testing';

import { MatMenuTriangleService } from './mat-menu-triangle.service';

describe('MatMenuTriangleService', () => {
  let service: MatMenuTriangleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatMenuTriangleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
