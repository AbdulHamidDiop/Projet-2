/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Question } from '@common/game';
import { VALID_QUESTION } from '@common/test-interfaces';
import { environment } from 'src/environments/environment';
import { FetchService } from './fetch.service';
import { QuestionsService } from './questions.service';
import SpyObj = jasmine.SpyObj;

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
    const questions: Question[] = [{ ...VALID_QUESTION }];
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
    let snackBarMock: SpyObj<MatSnackBar>;
    const fetchSpy = jasmine.createSpy().and.callFake(fetchMock);

    beforeEach(() => {
        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snackBarMock.open.and.returnValue({} as any);
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: FetchService,
                    useValue: {
                        fetch: fetchSpy,
                    },
                },
                { provide: MatSnackBar, useValue: snackBarMock },
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
        expect(service.questions).toEqual([VALID_QUESTION]);
        expect(fetchSpy).toHaveBeenCalled();
    }));

    it('addQuestion should send a POST request to API', fakeAsync(() => {
        service.addQuestion(VALID_QUESTION);
        tick();

        expect(fetchSpy).toHaveBeenCalledWith(
            environment.serverUrl + 'questions/add',
            jasmine.objectContaining({
                method: 'POST',
                body: JSON.stringify(VALID_QUESTION),
            }),
        );
    }));

    it('editQuestion should send a PUT request to API', fakeAsync(() => {
        service.editQuestion(VALID_QUESTION);
        tick();

        expect(fetchSpy).toHaveBeenCalledWith(
            environment.serverUrl + 'questions/edit',
            jasmine.objectContaining({
                method: 'PUT',
                body: JSON.stringify(VALID_QUESTION),
            }),
        );
    }));

    it('deleteQuestion should send a DELETE request to API and emit deleteRequest event', fakeAsync(() => {
        const deleteRequestSpy = spyOn(service.deleteRequest, 'emit');

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 204, statusText: 'No Content' })));

        service.deleteQuestion(VALID_QUESTION);
        tick();

        expect(deleteRequestSpy).toHaveBeenCalledWith(VALID_QUESTION);

        expect(service.questions).not.toContain(VALID_QUESTION);
    }));

    it('Getter for question attribute should work as intended', () => {
        service.questions = [];
        expect(service.question.id).toBeFalsy();
        service.questions = [VALID_QUESTION, VALID_QUESTION];
        service.currentQuestionIndex = 0;
        service.questions[0].id = '1234';
        expect(service.question.id).toEqual('1234');
        expect(service.currentQuestionIndex).toEqual(1); // Index incrémenté

        service.currentQuestionIndex = 1;
        service.questions[1].id = '4321';
        expect(service.question.id).toEqual('4321');
        expect(service.currentQuestionIndex).toEqual(1);
    });

    it('Should fetch random questions on call to getRandomQuestions', fakeAsync(() => {
        returnQuestion = true;
        responseSetToOk = true;
        let questions: Question[] = [];
        service.getRandomQuestions().then((randomQuestions) => {
            questions = randomQuestions;
        });
        tick();
        expect(questions).toEqual([VALID_QUESTION]);
        expect(fetchSpy).toHaveBeenCalled();
    }));

    it('All methods should throw error code when response not ok', async () => {
        responseSetToOk = false;
        service.addQuestion(VALID_QUESTION).catch((error) => {
            expect(error).toEqual(new Error(`Error: ${errorResponse.status}`));
        });
        service.editQuestion(VALID_QUESTION).catch((error) => {
            expect(error).toEqual(new Error(`Error: ${errorResponse.status}`));
        });
        service.deleteQuestion(VALID_QUESTION).catch((error) => {
            expect(error).toEqual(new Error(`Error: ${errorResponse.status}`));
        });

        service.getAllQuestions().catch((error) => {
            expect(error).toEqual(new Error(`Error: ${errorResponse.status}`));
        });
        service.getRandomQuestions().catch((error) => {
            expect(error).toEqual(new Error(`Error: ${errorResponse.status}`));
        });
    });
});
