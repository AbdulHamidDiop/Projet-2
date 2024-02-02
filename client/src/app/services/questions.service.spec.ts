import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { API_URL } from '@common/consts';
import { Choices, Question, Type } from '@common/game';
import { QuestionsService } from './questions.service';

describe('QuestionsService', () => {
    let service: QuestionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(QuestionsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with an empty array of questions', () => {
        expect(service.questions).toEqual([]);
    });

    it('getAllQuestions should fetch questions from API', fakeAsync(() => {
        const mockChoices: Choices[] = [{ text: 'Choice 1', isCorrect: true }];
        const mockQuestion: Question = {
            id: '1',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'Question 1',
            points: 5,
            choices: mockChoices,
        };
        spyOn(window, 'fetch').and.returnValue(Promise.resolve({ ok: true, json: async () => Promise.resolve([mockQuestion]) } as Response));

        service.getAllQuestions();
        tick();

        expect(service.questions).toEqual([mockQuestion]);
    }));

    it('sortAllQuestions should sort questions by lastModification date', () => {
        const questions: Question[] = [
            { id: '1', type: Type.QCM, lastModification: new Date('2023-01-01'), text: 'Question 1', points: 5, choices: [] },
            { id: '2', type: Type.QCM, lastModification: new Date('2022-01-01'), text: 'Question 2', points: 5, choices: [] },
        ];

        service.questions = questions;

        const sortedQuestions = service.sortAllQuestions();

        expect(sortedQuestions).toEqual([questions[1], questions[0]]);
    });

    it('addQuestion should send a POST request to API', fakeAsync(() => {
        const mockChoices: Choices[] = [{ text: 'Choice 1', isCorrect: true }];
        const mockQuestion: Question = {
            id: '1',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'New Question',
            points: 5,
            choices: mockChoices,
        };
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve(new Response(JSON.stringify([mockQuestion]), { status: 200, headers: { 'Content-type': 'application/json' } })),
        );
        service.addQuestion(mockQuestion);
        tick();

        expect(window.fetch).toHaveBeenCalledWith(
            API_URL + 'questions/add',
            jasmine.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockQuestion),
            }),
        );
    }));

    it('editQuestion should send a PUT request to API', fakeAsync(() => {
        const mockChoices: Choices[] = [{ text: 'Choice 1', isCorrect: true }];
        const mockQuestion: Question = {
            id: '1',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'Updated Question',
            points: 5,
            choices: mockChoices,
        };
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve(new Response(null, { status: 200, statusText: 'OK', headers: { 'Content-type': 'application/json' } })),
        );

        service.editQuestion(mockQuestion);
        tick();

        expect(window.fetch).toHaveBeenCalledWith(
            API_URL + 'questions/edit',
            jasmine.objectContaining({
                method: 'PUT',
                body: JSON.stringify(mockQuestion),
            }),
        );
    }));

    it('deleteQuestion should send a DELETE request to API and emit deleteRequest event', fakeAsync(() => {
        const mockChoices: Choices[] = [{ text: 'Choice 1', isCorrect: true }];
        const mockQuestion: Question = {
            id: '1',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'Question to delete',
            points: 5,
            choices: mockChoices,
        };

        const deleteRequestSpy = spyOn(service.deleteRequest, 'emit');

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 204, statusText: 'No Content' })));

        service.deleteQuestion(mockQuestion);
        tick();

        expect(window.fetch).toHaveBeenCalledWith(
            API_URL + 'questions/delete/1',
            jasmine.objectContaining({
                method: 'DELETE',
            }),
        );
        expect(deleteRequestSpy).toHaveBeenCalledWith(mockQuestion);

        expect(service.questions).not.toContain(mockQuestion);
    }));
});
