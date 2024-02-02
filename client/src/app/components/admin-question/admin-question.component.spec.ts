import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminQuestionComponent } from './admin-question.component';
// eslint-disable-next-line no-restricted-imports

describe('AdminQuestionComponent', () => {
    let component: AdminQuestionComponent;
    let fixture: ComponentFixture<AdminQuestionComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [AdminQuestionComponent],
            providers: [MatDialog],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminQuestionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
