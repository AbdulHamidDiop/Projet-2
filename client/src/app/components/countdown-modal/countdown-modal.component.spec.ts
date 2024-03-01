import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountdownModalComponent } from './countdown-modal.component';

describe('CountdownModalComponent', () => {
    let component: CountdownModalComponent;
    let fixture: ComponentFixture<CountdownModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CountdownModalComponent],
        });
        fixture = TestBed.createComponent(CountdownModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
