/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { API_URL } from '@common/consts';
import { Choices, Question, Type } from '@common/game';
import { FetchService } from './fetch.service';
import { QuestionsService } from './questions.service';

const mockChoices: Choices[] = [
    { text: 'Choice 1', isCorrect: true },
    { text: 'Choice 2', isCorrect: false },
];
const mockQuestion: Question = {
    id: '1',
    type: Type.QCM,
    lastModification: new Date(),
    text: 'Question 1',
    points: 5,
    choices: mockChoices,
    answer: '',
};

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

let returnQuestion = true;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function jsonMock(): Promise<any> {
    const questions: Question[] = [{ ...mockQuestion }];
    if (returnQuestion) {
        return questions;
    } else {
        return { isCorrect: true };
    }
}

async function textMock(): Promise<string> {
    return '';
}

let responseSetToOk = true;
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

describe('QuestionsService', () => {
    let service: QuestionsService;
    const fetchSpy = jasmine.createSpy().and.callFake(fetchMock);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: FetchService,
                    useValue: {
                        fetch: fetchSpy,
                    },
                },
            ],
        });
        service = TestBed.inject(QuestionsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with an empty array of questions', () => {
        expect(service.questions).toEqual([]);
    });

    it('getAllQuestions should fetch questions from API', fakeAsync(() => {
        service.getAllQuestions();
        tick();
        expect(service.questions).toEqual([mockQuestion]);
        expect(fetchSpy).toHaveBeenCalled();
    }));

    it('addQuestion should send a POST request to API', fakeAsync(() => {
        service.addQuestion(mockQuestion);
        tick();

        expect(fetchSpy).toHaveBeenCalledWith(
            API_URL + 'questions/add',
            jasmine.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockQuestion),
            }),
        );
    }));

    it('editQuestion should send a PUT request to API', fakeAsync(() => {
        service.editQuestion(mockQuestion);
        tick();

        expect(fetchSpy).toHaveBeenCalledWith(
            API_URL + 'questions/edit',
            jasmine.objectContaining({
                method: 'PUT',
                body: JSON.stringify(mockQuestion),
            }),
        );
    }));

    it('deleteQuestion should send a DELETE request to API and emit deleteRequest event', fakeAsync(() => {
        const deleteRequestSpy = spyOn(service.deleteRequest, 'emit');

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 204, statusText: 'No Content' })));

        service.deleteQuestion(mockQuestion);
        tick();

        expect(fetchSpy).toHaveBeenCalledWith(
            API_URL + 'questions/delete/1',
            jasmine.objectContaining({
                method: 'DELETE',
            }),
        );
        expect(deleteRequestSpy).toHaveBeenCalledWith(mockQuestion);

        expect(service.questions).not.toContain(mockQuestion);
    }));

    it('Check answer should return false if response does not have attribute isCorrect', async () => {
        returnQuestion = true; // Le JSON mock va retourner un objet sans attribut isCorrect
        const checkAnswer: boolean = await service.checkAnswer([''], '');
        expect(checkAnswer).toBeFalsy();
    });

    it('Check answer should return true if answer is correct', async () => {
        returnQuestion = false; // Le JSON mock va retourner l'objet { isCorrect: true }
        const checkAnswer: boolean = await service.checkAnswer([''], '');
        expect(checkAnswer).toBeTruthy();
        returnQuestion = true;
    });

    it('Getter for question attribute should work as intended', () => {
        service.questions = [];
        expect(service.question.id).toBeFalsy();
        service.questions = [mockQuestion, mockQuestion];
        service.currentQuestionIndex = 0;
        service.questions[0].id = '1234';
        expect(service.question.id).toEqual('1234');
        expect(service.currentQuestionIndex).toEqual(1); // Index incrémenté

        service.currentQuestionIndex = 1;
        service.questions[1].id = '4321';
        expect(service.question.id).toEqual('4321');
        expect(service.currentQuestionIndex).toEqual(1);
    });

    it('Should fetch questions on call to getQuestionsWithoutCorrectShow', () => {
        responseSetToOk = true;
        service.questions = [];
        service.getQuestionsWithoutCorrectShown();
        expect(fetchSpy).toHaveBeenCalled();
    });

    it('All methods should throw error code when response not ok', async () => {
        responseSetToOk = false;
        service.addQuestion(mockQuestion).catch((error) => {
            expect(error).toEqual(new Error(`Error: ${errorResponse.status}`));
        });
        service.editQuestion(mockQuestion).catch((error) => {
            expect(error).toEqual(new Error(`Error: ${errorResponse.status}`));
        });
        service.deleteQuestion(mockQuestion).catch((error) => {
            expect(error).toEqual(new Error(`Error: ${errorResponse.status}`));
        });
        service.getQuestionsWithoutCorrectShown().catch((error) => {
            expect(error).toEqual(new Error(`Error: ${errorResponse.status}`));
        });
        service.getAllQuestions().catch((error) => {
            expect(error).toEqual(new Error(`Error: ${errorResponse.status}`));
        });
        const checkAnswer: boolean = await service.checkAnswer([''], '');
        expect(checkAnswer).toBeFalsy();
    });
});
