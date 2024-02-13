import { Question } from '@common/game';
import { expect } from 'chai';
import * as fs from 'fs';
import { SinonStub, stub } from 'sinon';
import { QuestionsService } from './questions.service';

const DATALENGTH = 1;

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
    lastModification: '2021-01-31T16:39:55.649Z',
};

const SECOND_QUESTION = {
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
    id: '00000000-1111-2222-test-111111111111',
    lastModification: '2024-01-31T16:39:55.649Z',
};

let QUESTIONS = JSON.stringify([FIRST_QUESTION]);

describe('Questions Service', () => {
    let questionsService: QuestionsService;
    let readFileStub: SinonStub;
    let writeFileStub: SinonStub;

    beforeEach(async () => {
        readFileStub = stub(fs.promises, 'readFile').resolves(QUESTIONS);
        writeFileStub = stub(fs.promises, 'writeFile').callsFake(async (path: fs.PathLike, data: string) => {
            return new Promise<void>((resolve) => {
                QUESTIONS = data;
                resolve();
            });
        });

        questionsService = new QuestionsService();
    });

    afterEach(() => {
        readFileStub.restore();
        writeFileStub.restore();
    });

    it('should get all questions', async () => {
        const questions = await questionsService.getAllQuestions();
        expect(questions).to.be.an('array').with.lengthOf(DATALENGTH);
        expect(questions[0]).to.deep.equal(FIRST_QUESTION);
        expect(readFileStub.called);
    });

    it('should add a question to the database', async () => {
        await questionsService.addQuestion(SECOND_QUESTION as unknown as Question);
        expect(JSON.parse(QUESTIONS)).to.be.an('array');
        expect(JSON.parse(QUESTIONS)).to.have.lengthOf(DATALENGTH + 1);
        expect(JSON.parse(QUESTIONS)[DATALENGTH]).to.deep.equal(SECOND_QUESTION);
        expect(readFileStub.called);
        expect(writeFileStub.called);
    });

    it('should get all questions sorted by newest first', async () => {
        const questions = await questionsService.sortAllQuestions();
        expect(questions)
            .to.be.an('array')
            .with.lengthOf(DATALENGTH + 1);
        expect(questions).to.deep.equal([SECOND_QUESTION, FIRST_QUESTION]);
        expect(readFileStub.called);
    });

    it('should change a question from the database, if that question already exists', async () => {
        const newText = 'Nouveau Texte';
        await questionsService.addQuestion({ ...SECOND_QUESTION, text: newText } as unknown as Question);
        expect(JSON.parse(QUESTIONS)).to.be.an('array');
        expect(JSON.parse(QUESTIONS)).to.have.lengthOf(DATALENGTH + 1);
        expect(JSON.parse(QUESTIONS)[DATALENGTH].text).to.equal(newText);

        expect(readFileStub.called);
        expect(writeFileStub.called);
    });

    it('should delete a question from the database based on its id', async () => {
        await questionsService.deleteQuestionByID(SECOND_QUESTION.id);
        expect(JSON.parse(QUESTIONS)).to.be.an('array');
        expect(JSON.parse(QUESTIONS)).to.have.lengthOf(1);
        expect(readFileStub.called);
        expect(writeFileStub.called);
    });
    it('should not delete an unexisting question ', async () => {
        await questionsService.deleteQuestionByID('FakeID');
        expect(JSON.parse(QUESTIONS)).to.be.an('array');
        expect(JSON.parse(QUESTIONS)).to.have.lengthOf(1);
        expect(readFileStub.called);
        expect(writeFileStub.notCalled);
    });

    it('should get questions without correct shown', async () => {
        const questions = await questionsService.getQuestionsWithoutCorrectShown();
        expect(questions).to.be.an('array').with.lengthOf(DATALENGTH);
        expect(questions[0].choices[0]).to.not.have.property('isCorrect');
        expect(questions[0].choices[1]).to.not.have.property('isCorrect');
        expect(questions[0].choices[2]).to.not.have.property('isCorrect');
        expect(readFileStub.called);
    });

    it('should return whether an answer is correct or not', async () => {
        const isCorrect = await questionsService.isCorrectAnswer(['Angular = back-end, NodeJS = front-end'], FIRST_QUESTION.id);
        expect(isCorrect).to.equal(true);

        const isNotCorrect = await questionsService.isCorrectAnswer(['Angular = front-end, NodeJS = back-end'], FIRST_QUESTION.id);
        expect(isNotCorrect).to.equal(false);
        expect(readFileStub.called);

        // test that it returns true if the question is a qrl
        stub(questionsService, 'getAllQuestions').resolves([{ type: 'QRL' } as unknown as Question]);
        const isCorrectQRL = await questionsService.isCorrectAnswer(['qrl answer'], 'qrl id');
        expect(isCorrectQRL).to.equal(true);
    });
});
