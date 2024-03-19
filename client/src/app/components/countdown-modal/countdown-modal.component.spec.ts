import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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

    it('should start countdown and emit modalClosed when showModal becomes true', fakeAsync(() => {
        spyOn(window, 'setInterval');
        component.showModal = true;

        component.ngOnChanges({
            showModal: new SimpleChange(false, true, false),
        });
        fixture.detectChanges();

        let wasClosed = false;
        component.modalClosed.subscribe(() => (wasClosed = true));
        tick();
        component.modalClosed.emit();
        expect(wasClosed).toBeTrue();

        expect(window.setInterval).toHaveBeenCalled();
    }));

    it('should display message', () => {
        component.message = 'Test Message';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.message-selector').textContent).toContain('Test Message');
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
