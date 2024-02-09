import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialog } from '@angular/material/dialog';
import { AppModule } from '@app/app.module';
// eslint-disable-next-line no-restricted-imports
import { CreateQuestionDialogComponent } from '../create-question-dialog/create-question-dialog.component';
import { AdminQuestionComponent } from './admin-question.component';
// eslint-disable-next-line no-restricted-imports

describe('AdminQuestionComponent', () => {
    let component: AdminQuestionComponent;
    let fixture: ComponentFixture<AdminQuestionComponent>;

    beforeEach(async () => {
        const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        TestBed.configureTestingModule({
            imports: [AppModule],
            declarations: [AdminQuestionComponent, CreateQuestionDialogComponent],
            providers: [{ provide: MatDialog, useValue: matDialogSpy }],
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
