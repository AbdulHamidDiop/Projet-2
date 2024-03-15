import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinGameModalComponentComponent } from './join-game-modal-component.component';

describe('JoinGameModalComponentComponent', () => {
  let component: JoinGameModalComponentComponent;
  let fixture: ComponentFixture<JoinGameModalComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JoinGameModalComponentComponent]
    });
    fixture = TestBed.createComponent(JoinGameModalComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
