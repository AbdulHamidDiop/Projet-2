import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostGameViewComponent } from './host-game-view.component';

describe('HostGameViewComponent', () => {
    let component: HostGameViewComponent;
    let fixture: ComponentFixture<HostGameViewComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostGameViewComponent],
        });
        fixture = TestBed.createComponent(HostGameViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
