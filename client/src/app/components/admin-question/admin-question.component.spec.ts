/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialog } from '@angular/material/dialog';
// eslint-disable-next-line no-restricted-imports
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { QuestionsService } from '@app/services/questions.service';
import { Question, Type } from '@common/game';
import { Observable } from 'rxjs';
import { CreateQuestionDialogComponent } from '../create-question-dialog/create-question-dialog.component';
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

const observableQuestion: Observable<Question[]> = new Observable((subscriber) => {
    subscriber.next([validQuestion]);
});

let openCallCount = 0;
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function openCallCountFunction() {
    openCallCount++;
    return { afterClosed: () => observableQuestion };
}

let editQuestionCallCount = 0;
function editQuestionCallCountFunction() {
    editQuestionCallCount++;
}

let deleteQuestionCallCount = 0;
function deleteQuestionCallCountFunction() {
    deleteQuestionCallCount++;
}

describe('AdminQuestionComponent', () => {
    let component: AdminQuestionComponent;
    let fixture: ComponentFixture<AdminQuestionComponent>;

    beforeEach(async () => {
        //        const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']).and.callFake(openCallCountFunction);
        TestBed.configureTestingModule({
            imports: [AppMaterialModule, BrowserAnimationsModule],
            declarations: [AdminQuestionComponent, CreateQuestionDialogComponent],
            providers: [
                {
                    provide: MatDialog,
                    useValue: {
                        open: jasmine.createSpy('open').and.callFake(openCallCountFunction),
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
                        editQuestion: jasmine.createSpy('editQuestion').and.callFake(editQuestionCallCountFunction),
                        deleteQuestion: jasmine.createSpy('deleteQuestion').and.callFake(deleteQuestionCallCountFunction),
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

    it("Le système doit permettre la suppression et modification d'une question existante.", () => {
        openCallCount = 0;
        component.openDialog();
        expect(openCallCount === 1).toBeTruthy();

        observableQuestion.subscribe(() => {
            expect(editQuestionCallCount === 1).toBeTruthy();
        });

        deleteQuestionCallCount = 0;
        component.deleteQuestion(validQuestion);
        expect(deleteQuestionCallCount === 1).toBeTruthy();
    });

    it('Le système doit faire un appel à questionService.editQuestion pour éditer une question', () => {
        editQuestionCallCount = 0;
        component.openDialog();
        observableQuestion.subscribe(() => {
            expect(editQuestionCallCount === 1).toBeTruthy();
        });
    });

    it('Le système doit faire un appel à questionService.deleteQuestion pour supprimer une question', () => {
        deleteQuestionCallCount = 0;
        component.deleteQuestion(validQuestion);
        expect(deleteQuestionCallCount === 1).toBeTruthy();
    });
});
