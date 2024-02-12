import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppMaterialModule } from '@app/modules/material.module';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
    let component: ConfirmDialogComponent;
    let fixture: ComponentFixture<ConfirmDialogComponent>;

    const dialogCloseSpy = jasmine.createSpy('close').and.callThrough();

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppMaterialModule],
            declarations: [ConfirmDialogComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close: dialogCloseSpy,
                    },
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        title: 'Title',
                        message: 'Message',
                    },
                },
            ],
        });
        fixture = TestBed.createComponent(ConfirmDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Should call MatDialogRef.close on pressing confirm button, MatDialogRef.close on pressing dismiss button', () => {
        component.onConfirm();
        expect(dialogCloseSpy).toHaveBeenCalled();
        dialogCloseSpy.calls.reset();
        component.onDismiss();
        expect(dialogCloseSpy).toBeTruthy();
    });
});
