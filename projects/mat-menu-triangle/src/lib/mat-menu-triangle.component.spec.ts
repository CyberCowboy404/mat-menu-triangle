import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatMenuTriangleComponent } from './mat-menu-triangle.component';

describe('MatMenuTriangleComponent', () => {
  let component: MatMenuTriangleComponent;
  let fixture: ComponentFixture<MatMenuTriangleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatMenuTriangleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatMenuTriangleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
