/* eslint-disable no-restricted-imports */
import { Question } from '@common/game';
import { DB_COLLECTION_QUESTIONS } from '@common/utils/env';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { stub } from 'sinon';
import { DatabaseService } from './database.service';
import { QuestionsService } from './questions.service';

const FIRST_QUESTION = {
    type: 'QCM',
    text: 'Quelle est la différence entre NodeJS et Angular',
    points: 20,
    addToBank: true,
    choices: [
        {
            text: 'Angular = front-end, NodeJS = back-end',
            isCorrect: false,
        },
        {
            text: 'Angular = back-end, NodeJS = front-end',
            isCorrect: true,
        },
        {
            text: 'Aucune de ces réponses',
            isCorrect: false,
        },
    ],
    id: '00000000-1111-2222-test-000000000000',
    lastModification: '2024-01-31T16:39:55.649Z',
};

const SECOND_QUESTION = {
    type: 'QCM',
    text: 'Quelle est la différence entre Python et C++',
    points: 20,
    addToBank: true,
    choices: [
        {
            text: 'Angular = front-end, NodeJS = back-end',
            isCorrect: false,
        },
        {
            text: 'Angular = back-end, NodeJS = front-end',
            isCorrect: true,
        },
        {
            text: 'Aucune de ces réponses',
            isCorrect: false,
        },
    ],
    id: '00000000-1111-2222-test-111111111111',
    lastModification: '2022-01-31T16:39:55.649Z',
};

// let QUESTIONS = JSON.stringify([FIRST_QUESTION]);

describe('Questions Service', () => {
    let questionService: QuestionsService;
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseService();
        questionService = new QuestionsService(databaseService);
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
    });

    afterEach(async () => {
        if (databaseService['client']) {
            await databaseService['client'].close();
        }
    });

    it('should get all questions', async () => {
        await databaseService.db.collection(DB_COLLECTION_QUESTIONS).insertMany([FIRST_QUESTION, SECOND_QUESTION]);
        const questions = await questionService.getAllQuestions();
        expect(questions.length).to.deep.equal(2);
    });

    it('should add a question to the database', async () => {
        const result = await questionService.addQuestion(SECOND_QUESTION as unknown as Question);
        expect(result).to.equal(true);
    });

    it('should not add a redundant question to the database', async () => {
        await questionService.addQuestion(SECOND_QUESTION as unknown as Question);
        const result = await questionService.addQuestion({ ...SECOND_QUESTION, id: 'new_id' } as unknown as Question);
        expect(result).to.equal(false);
    });

    it('should get all questions sorted by oldest first', async () => {
        await databaseService.db.collection(DB_COLLECTION_QUESTIONS).insertMany([FIRST_QUESTION, SECOND_QUESTION]);
        const questions = await questionService.sortAllQuestions();
        expect(questions).to.be.an('array').with.lengthOf(2);
        expect(questions).to.deep.equal([SECOND_QUESTION, FIRST_QUESTION]);
    });

    it('should change a question from the database, if that question already exists', async () => {
        const question = { ...SECOND_QUESTION, _id: 'new id' } as unknown as Question;
        await databaseService.db.collection(DB_COLLECTION_QUESTIONS).insertOne(question);
        await questionService.addQuestion({ ...SECOND_QUESTION, text: 'Nouveau Texte' } as unknown as Question);
        const questions = await questionService.getAllQuestions();
        expect(questions).to.be.an('array');
        expect(questions).to.have.lengthOf(1);
        expect(questions[0].text).to.equal('Nouveau Texte');
    });

    it('should delete a question from the database based on its id', async () => {
        await databaseService.db.collection(DB_COLLECTION_QUESTIONS).insertOne(FIRST_QUESTION);
        await questionService.deleteQuestionByID(FIRST_QUESTION.id);
        const questions = await questionService.getAllQuestions();
        expect(questions.length).to.deep.equal(0);
    });

    it('should not delete an unexisting question ', async () => {
        await databaseService.db.collection(DB_COLLECTION_QUESTIONS).insertOne(FIRST_QUESTION);
        await questionService.deleteQuestionByID('Fake id');
        const questions = await questionService.getAllQuestions();
        expect(questions.length).to.deep.equal(1);
    });

    it('should get questions without correct shown', async () => {
        await databaseService.db.collection(DB_COLLECTION_QUESTIONS).insertOne(FIRST_QUESTION);
        const questions = await questionService.getQuestionsWithoutCorrectShown();
        expect(questions).to.be.an('array').with.lengthOf(1);
        expect(questions[0].choices[0]).to.not.have.property('isCorrect');
        expect(questions[0].choices[1]).to.not.have.property('isCorrect');
        expect(questions[0].choices[2]).to.not.have.property('isCorrect');
    });

    it('should return whether an answer is correct or not', async () => {
        await databaseService.db.collection(DB_COLLECTION_QUESTIONS).insertOne(FIRST_QUESTION);
        const isCorrect = await questionService.isCorrectAnswer(['Angular = back-end, NodeJS = front-end'], FIRST_QUESTION.id);
        expect(isCorrect).to.equal(true);

        const isNotCorrect = await questionService.isCorrectAnswer(['Angular = front-end, NodeJS = back-end'], FIRST_QUESTION.id);
        expect(isNotCorrect).to.equal(false);

        // test that it returns true if the question is a qrl
        stub(questionService, 'getAllQuestions').resolves([{ type: 'QRL' } as unknown as Question]);
        const isCorrectQRL = await questionService.isCorrectAnswer(['qrl answer'], 'qrl id');
        expect(isCorrectQRL).to.equal(true);
    });
});
