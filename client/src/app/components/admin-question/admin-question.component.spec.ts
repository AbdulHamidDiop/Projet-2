/* eslint-disable @typescript-eslint/no-explicit-any */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { QuestionsService } from '@app/services/questions.service';
import { Question } from '@common/game';
import { VALID_QUESTION } from '@common/test-interfaces';
import { Observable, of } from 'rxjs';
import { AdminQuestionComponent } from './admin-question.component';
import SpyObj = jasmine.SpyObj;

describe('AdminQuestionComponent', () => {
    let component: AdminQuestionComponent;
    let fixture: ComponentFixture<AdminQuestionComponent>;
    const observableQuestion: Observable<Question[]> = new Observable((subscriber) => {
        subscriber.next([VALID_QUESTION]);
    });
    const editQuestionSpy = jasmine.createSpy('editQuestion').and.callThrough();
    const deleteQuestionSpy = jasmine.createSpy('deleteQuestion').and.callThrough();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let openDialogSpy: SpyObj<MatDialog>;

    beforeEach(async () => {
        openDialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
        openDialogSpy.open.and.returnValue({
            afterClosed: () => {
                return of({} as any);
            },
        } as MatDialogRef<any, any>);

        TestBed.configureTestingModule({
            imports: [AppMaterialModule, BrowserAnimationsModule],
            declarations: [AdminQuestionComponent],
            providers: [
                {
                    provide: MatDialog,
                    useValue: openDialogSpy,
                },
                {
                    provide: QuestionsService,
                    useValue: {
                        editQuestion: editQuestionSpy,
                        deleteQuestion: deleteQuestionSpy,
                    },
                },
                {
                    provide: Router,
                    useValue: {
                        url: '/admin/questions',
                    },
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminQuestionComponent);
        component = fixture.componentInstance;
        component.question = { ...VALID_QUESTION };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('System should call MatDialog.open when pressing button to edit question', () => {
        component.openDialog();
        expect(openDialogSpy.open).toHaveBeenCalled();
    });

    it('System should call questionService.editQuestion when pressing button to edit question', () => {
        component.openDialog();
        observableQuestion.subscribe(() => {
            expect(editQuestionSpy).toHaveBeenCalled();
        });
    });

    it('System should call questionService.deleteQuestion when pressing button to delete question', () => {
        component.deleteQuestion(VALID_QUESTION);
        expect(deleteQuestionSpy).toHaveBeenCalled();
    });
});
