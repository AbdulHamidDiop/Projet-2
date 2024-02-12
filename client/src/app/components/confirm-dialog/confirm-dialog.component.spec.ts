import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
    let component: ConfirmDialogComponent;
    let fixture: ComponentFixture<ConfirmDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [ConfirmDialogComponent],
            providers: [
                {
                    provide: MatDialogRef,
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        title: '',
                        message: '',
                    },
                },
            ],
        });
        fixture = TestBed.createComponent(ConfirmDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
