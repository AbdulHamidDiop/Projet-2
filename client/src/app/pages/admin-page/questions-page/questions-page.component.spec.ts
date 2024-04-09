/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateQuestionDialogComponent } from '@app/components/create-question-dialog/create-question-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { FetchService } from '@app/services/fetch.service';
import { QuestionsService } from '@app/services/questions.service';
import { Type } from '@common/game';
import { of } from 'rxjs';
import { QuestionsPageComponent } from './questions-page.component';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockData: any = {};

async function arrayBufferMock(): Promise<ArrayBuffer> {
    const buffer = new ArrayBuffer(0);
    return buffer;
}

async function blobMock(): Promise<Blob> {
    const blob = new Blob();
    return blob;
}

async function formDataMock(): Promise<FormData> {
    const formData = new FormData();
    return formData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function jsonMock(): Promise<any> {
    return mockData;
}

async function textMock(): Promise<string> {
    return '';
}

const responseSetToOk = true;
const response: Response = {
    ok: true,
    status: 200,
    headers: new Headers(),
    type: 'basic',
    redirected: false,
    statusText: '',
    url: '',
    clone: () => {
        return new Response();
    },
    body: new ReadableStream<Uint8Array>(),
    bodyUsed: false,
    arrayBuffer: arrayBufferMock,
    blob: blobMock,
    formData: formDataMock,
    json: jsonMock,
    text: textMock,
};
const errorResponse: Response = {
    ok: false,
    status: 404,
    type: 'basic',
    headers: new Headers(),
    redirected: false,
    statusText: '',
    url: '',
    clone: () => {
        return new Response();
    },
    body: new ReadableStream<Uint8Array>(),
    bodyUsed: false,
    arrayBuffer: arrayBufferMock,
    blob: blobMock,
    formData: formDataMock,
    json: jsonMock,
    text: textMock,
};

async function fetchMock(): Promise<Response> {
    if (responseSetToOk) {
        return response;
    } else {
        return errorResponse;
    }
}

describe('QuestionsPageComponent', () => {
    let component: QuestionsPageComponent;
    let fixture: ComponentFixture<QuestionsPageComponent>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockDialog: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockQuestion: any;

    beforeEach(() => {
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

        TestBed.configureTestingModule({
            declarations: [QuestionsPageComponent],
            imports: [RouterTestingModule, HttpClientModule],
            providers: [
                { provide: MatDialog, useValue: mockDialog },
                {
                    provide: FetchService,
                    useValue: {
                        fetch: jasmine.createSpy().and.callFake(fetchMock),
                    },
                },
                CommunicationService,
                QuestionsService,
            ],
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

        mockData = [mockQuestion];
        await component.ngOnInit();
        expect(component.questions).toEqual(mockData);
    });

    it('should open the dialog', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockDialogRef: any = {
            afterClosed: () => of(null),
        };
        mockDialog.open.and.returnValue(mockDialogRef);

        component.openDialog();

        expect(mockDialog.open).toHaveBeenCalledWith(CreateQuestionDialogComponent, {});
    });

    it('should push result to questions array if result exists', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockDialogRef: any = {
            afterClosed: () => of(mockQuestion),
        };
        mockDialog.open.and.returnValue(mockDialogRef);

        component.questions = [];

        component.openDialog();

        expect(component.questions).toEqual([mockQuestion]);
    });

    it('should not push result to questions array if result is null', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockDialogRef: any = {
            afterClosed: () => of(null),
        };
        mockDialog.open.and.returnValue(mockDialogRef);

        component.questions = [];

        component.openDialog();

        expect(component.questions).toEqual([]);
    });

    it('should toggle selectedTypes when toggleQuestionType is called', () => {
        spyOn(component, 'updateDisplayQuestions');

        expect(component.selectedTypes.size).toEqual(2);

        component.toggleQuestionType('QCM');
        expect(component.selectedTypes.size).toEqual(1);
        expect(component.selectedTypes.has('QCM')).toBeFalsy();
        expect(component.updateDisplayQuestions).toHaveBeenCalled();

        component.toggleQuestionType('QRL');
        expect(component.selectedTypes.size).toEqual(0);
        expect(component.selectedTypes.has('QRL')).toBeFalsy();
        expect(component.updateDisplayQuestions).toHaveBeenCalled();

        component.toggleQuestionType('QRL');
        expect(component.selectedTypes.size).toEqual(1);
        expect(component.selectedTypes.has('QRL')).toBeTruthy();
        expect(component.updateDisplayQuestions).toHaveBeenCalled();
    });

    it('should update displayQuestions based on selectedTypes', () => {
        component.questions = [mockQuestion, { ...mockQuestion, type: 'QRL' }];

        component.selectedTypes = new Set();
        component.updateDisplayQuestions();
        expect(component.displayQuestions.length).toEqual(0);

        component.selectedTypes = new Set(['QCM']);
        component.updateDisplayQuestions();
        expect(component.displayQuestions.length).toEqual(1);
        expect(component.displayQuestions[0].type).toEqual('QCM');

        component.selectedTypes = new Set(['QRL']);
        component.updateDisplayQuestions();
        expect(component.displayQuestions.length).toEqual(1);
        expect(component.displayQuestions[0].type).toEqual('QRL');

        component.selectedTypes = new Set(['QCM', 'QRL']);
        component.updateDisplayQuestions();
        expect(component.displayQuestions.length).toEqual(2);
    });
});
