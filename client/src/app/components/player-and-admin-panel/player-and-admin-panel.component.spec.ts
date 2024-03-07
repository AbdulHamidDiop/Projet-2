import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerAndAdminPanelComponent } from './player-and-admin-panel.component';

describe('PlayerAndAdminPanelComponent', () => {
  let component: PlayerAndAdminPanelComponent;
  let fixture: ComponentFixture<PlayerAndAdminPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerAndAdminPanelComponent]
    });
    fixture = TestBed.createComponent(PlayerAndAdminPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
