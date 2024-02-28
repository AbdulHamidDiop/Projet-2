import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsTestComponent } from './stats-test.component';

describe('StatsTestComponent', () => {
  let component: StatsTestComponent;
  let fixture: ComponentFixture<StatsTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatsTestComponent]
    });
    fixture = TestBed.createComponent(StatsTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
