import { Application } from '@app/app';
import { QuestionsService } from '@app/services/questions.service';
import { Question, Type } from '@common/game';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { SinonStubbedInstance, assert, createStubInstance } from 'sinon';
import supertest from 'supertest';
import { Container } from 'typedi';

describe('QuestionsController', () => {
    const questionList = [
        {
            id: '1',
            type: Type.QCM,
            lastModification: '2022-02-06T00:00:00',
            text: 'Sample question 1',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
                { text: 'Choice 3', isCorrect: true },
            ],
        },
        {
            id: '2',
            type: Type.QCM,
            lastModification: '2023-02-06T00:00:00',
            text: 'Sample question 2',
            points: 5,
            choices: [
                { text: 'Choice A', isCorrect: true },
                { text: 'Choice B', isCorrect: false },
            ],
        },
        {
            id: '3',
            type: Type.QCM,
            lastModification: '2024-02-06T00:00:00',
            text: 'Sample question 3',
            points: 5,
            choices: [
                { text: 'Choice A', isCorrect: true },
                { text: 'Choice B', isCorrect: false },
            ],
        },
    ];
    let questionService: SinonStubbedInstance<QuestionsService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        questionService = createStubInstance(QuestionsService);
        const app = Container.get(Application);
        Object.defineProperty(app['questionsController'], 'questionsService', { value: questionService });
        expressApp = app.app;
    });

    it('Should return all questions in order', async () => {
        questionService.sortAllQuestions.resolves([questionList[1], questionList[0]] as unknown as Question[]);
        return supertest(expressApp)
            .get('/api/questions')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal([questionList[1], questionList[0]]);
            });
    });

    it('Should add a question to db on valid post request to /add ', async () => {
        questionService.addQuestion.resolves(true);
        return supertest(expressApp).post('/api/questions/add').send(questionList[2]).set('Content', 'application/json').expect(StatusCodes.CREATED);
    });

    it('Should not add a question to db on invalid post request to /add ', async () => {
        questionService.addQuestion.resolves(false);
        return supertest(expressApp)
            .post('/api/questions/add')
            .send(questionList[2])
            .set('Content', 'application/json')
            .expect(StatusCodes.BAD_REQUEST);
    });

    it('Should add a question to db on valid post request to /edit ', async () => {
        questionService.addQuestion.resolves();
        return supertest(expressApp)
            .put('/api/questions/edit')
            .send(questionList[2])
            .set('Content', 'application/json')
            .expect(StatusCodes.NO_CONTENT);
    });

    it('Should delete a question from the database', async () => {
        const questionId = 'test';
        questionService.deleteQuestionByID.resolves(true);

        return supertest(expressApp)
            .delete(`/api/questions/delete/${questionId}`)
            .expect(StatusCodes.NO_CONTENT)
            .then((response) => {
                expect(response.status).to.equal(StatusCodes.NO_CONTENT);
                assert.calledWith(questionService.deleteQuestionByID, questionId);
            });
    });
    it('Should respond with 404 if question ID does not exist', async () => {
        const nonExistentQuestionId = 'nonExistentId'; 
        questionService.deleteQuestionByID.resolves(false);

        return supertest(expressApp)
            .delete(`/api/questions/delete/${nonExistentQuestionId}`)
            .expect(StatusCodes.NOT_FOUND)
            .then(() => {
                assert.calledWith(questionService.deleteQuestionByID, nonExistentQuestionId);
            });
    });

    it('Should return true if answer is correct', async () => {
        const answer = 'Choice 1';
        const id = '1';
        questionService.isCorrectAnswer.resolves(true);
        return supertest(expressApp)
            .post('/api/questions/check')
            .send({ answer, id })
            .set('Content', 'application/json')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal({ isCorrect: true });
            });
    });

    it('Should random questions if possible', async () => {
        questionService.getRandomQuestions.resolves([{}, {}, {}, {}, {}] as Question[]);
        return supertest(expressApp)
            .get('/api/questions/random')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal([{}, {}, {}, {}, {}] as Question[]);
            });
    });

    it('Should send status code 422 if not enough questions', async () => {
        questionService.getRandomQuestions.rejects(new Error('Not enough QCM questions'));
        return supertest(expressApp)
            .get('/api/questions/random')
            .expect(StatusCodes.UNPROCESSABLE_ENTITY)
            .then((response) => {
                expect(response.body.message).to.deep.equal('Not enough QCM questions available.');
            });
    });
});
