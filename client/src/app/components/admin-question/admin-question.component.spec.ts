/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialog } from '@angular/material/dialog';
// eslint-disable-next-line no-restricted-imports
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { QuestionsService } from '@app/services/questions.service';
import { Question, Type } from '@common/game';
import { Observable } from 'rxjs';
import { AdminQuestionComponent } from './admin-question.component';
// eslint-disable-next-line no-restricted-imports

const validQuestion: Question = {
    id: '2',
    lastModification: null,
    type: Type.QCM,
    text: 'Question valide',
    points: 10,
    choices: [
        {
            text: 'Choix valide #1',
            isCorrect: true,
        },
        {
            text: 'Choix valide #2',
            isCorrect: false,
        },
    ],
    answer: 'Choix #1',
};

describe('AdminQuestionComponent', () => {
    let component: AdminQuestionComponent;
    let fixture: ComponentFixture<AdminQuestionComponent>;
    const observableQuestion: Observable<Question[]> = new Observable((subscriber) => {
        subscriber.next([validQuestion]);
    });
    const editQuestionSpy = jasmine.createSpy('editQuestion').and.callThrough();
    const deleteQuestionSpy = jasmine.createSpy('deleteQuestion').and.callThrough();
    const openDialogSpy = jasmine.createSpy('open').and.callFake(() => {
        return { afterClosed: () => observableQuestion };
    });

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [AppMaterialModule, BrowserAnimationsModule],
            declarations: [AdminQuestionComponent],
            providers: [
                {
                    provide: MatDialog,
                    useValue: {
                        open: openDialogSpy,
                    },
                },
                /*                {
                    provide: MatDialogRef,
                    useValue: {
                        subscribe: jasmine.createSpy('subscribe').and.callThrough(),
                    },
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { question: validQuestion },
                },*/
                {
                    provide: QuestionsService,
                    useValue: {
                        editQuestion: editQuestionSpy,
                        deleteQuestion: deleteQuestionSpy,
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminQuestionComponent);
        component = fixture.componentInstance;
        component.question = validQuestion;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('System should call MatDialog.open when pressing button to edit question', () => {
        component.openDialog();
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('System should call questionService.editQuestion when pressing button to edit question', () => {
        component.openDialog();
        observableQuestion.subscribe(() => {
            expect(editQuestionSpy).toHaveBeenCalled();
        });
    });

    it('System should call questionService.deleteQuestion when pressing button to delete question', () => {
        component.deleteQuestion(validQuestion);
        expect(deleteQuestionSpy).toHaveBeenCalled();
    });
});
