import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CountdownModalComponent } from './countdown-modal.component';

const ONE_SECOND = 1000;

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

    it('should start countdown and emit modalClosed when showModal becomes true', fakeAsync(() => {
        component.showModal = true;
        component.countdown = 3;

        let wasClosed = false;
        component.modalClosed.subscribe(() => (wasClosed = true));

        component.ngOnChanges({
            showModal: new SimpleChange(false, true, true),
        });

        tick(ONE_SECOND * 3);

        fixture.detectChanges();

        expect(component.countdown).toBe(0);
        expect(component.showModal).toBeFalse();
        expect(wasClosed).toBeTrue();
    }));

    it('should display message', () => {
        component.message = 'Test Message';
        component.showModal = true;
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.message').textContent).toContain('Test Message');
    });

    it('should not start countdown when showModal becomes false', fakeAsync(() => {
        spyOn(window, 'setInterval');
        component.showModal = false;

        component.ngOnChanges({
            showModal: new SimpleChange(true, false, false),
        });
        fixture.detectChanges();

        expect(window.setInterval).not.toHaveBeenCalled();
    }));
});
