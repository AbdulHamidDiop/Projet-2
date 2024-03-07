import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectUsernameComponent } from './select-username.component';

describe('SelectUsernameComponent', () => {
  let component: SelectUsernameComponent;
  let fixture: ComponentFixture<SelectUsernameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectUsernameComponent]
    });
    fixture = TestBed.createComponent(SelectUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
