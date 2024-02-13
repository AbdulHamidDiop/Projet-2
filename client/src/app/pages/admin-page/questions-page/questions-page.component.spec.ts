import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateQuestionDialogComponent } from '@app/components/create-question-dialog/create-question-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { QuestionsService } from '@app/services/questions.service';
import { Question, Type } from '@common/game';
import { of } from 'rxjs';
import { QuestionsPageComponent } from './questions-page.component';

describe('QuestionsPageComponent', () => {
    let component: QuestionsPageComponent;
    let fixture: ComponentFixture<QuestionsPageComponent>;
    let mockDialog: any;
    let mockQuestion: Question;

    beforeEach(() => {
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

        TestBed.configureTestingModule({
            declarations: [QuestionsPageComponent],
            imports: [RouterTestingModule, HttpClientModule],
            providers: [{ provide: MatDialog, useValue: mockDialog }, CommunicationService, QuestionsService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionsPageComponent);
        component = fixture.componentInstance;
        mockQuestion = {
            id: '1',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'What is the capital of France?',
            points: 10,
            choices: [
                { text: 'Paris', isCorrect: true },
                { text: 'Berlin', isCorrect: false },
                { text: 'London', isCorrect: false },
                { text: 'Madrid', isCorrect: false },
            ],
        };
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to home if not authenticated', () => {
        component.communicationService.sharedVariable$ = of(false);
        const routerSpy = spyOn(component.router, 'navigate');
        component.ngOnInit();
        expect(routerSpy).toHaveBeenCalledWith(['/home']);
    });
    it('should get questions when authentificated', async () => {
        component.communicationService.sharedVariable$ = of(true);
        spyOn(component.questionsService, 'getAllQuestions').and.returnValue(Promise.resolve([mockQuestion]));
        await component.ngOnInit();
        expect(component.questions).toEqual([mockQuestion]);
    });

    it('should open the dialog', () => {
        const mockDialogRef: unknown = {
            afterClosed: () => of(null),
        };
        mockDialog.open.and.returnValue(mockDialogRef);

        component.openDialog();

        expect(mockDialog.open).toHaveBeenCalledWith(CreateQuestionDialogComponent, {});
    });

    it('should push result to questions array if result exists', () => {
        const mockDialogRef: unknown = {
            afterClosed: () => of(mockQuestion),
        };
        mockDialog.open.and.returnValue(mockDialogRef);

        component.questions = [];

        component.openDialog();

        expect(component.questions).toEqual([mockQuestion]);
    });

    it('should not push result to questions array if result is null', () => {
        const mockDialogRef: unknown = {
            afterClosed: () => of(null),
        };
        mockDialog.open.and.returnValue(mockDialogRef);

        component.questions = [];

        component.openDialog();

        expect(component.questions).toEqual([]);
    });
});
