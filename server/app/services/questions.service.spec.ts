import { Question } from '@common/game';
import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import { QuestionsService } from './questions.service';

const QUESTIONS = [
    {
        type: 'QCM',
        text: 'Quel mot-clé parmi les suivants ne figure pas dans HTML ?',
        points: 30,
        addToBank: false,
        choices: [
            {
                text: 'div',
                isCorrect: false,
            },
            {
                text: 'li',
                isCorrect: true,
            },
            {
                text: 'mat-input',
                isCorrect: true,
            },
            {
                text: 'button',
                isCorrect: false,
            },
            {
                text: 'table',
                isCorrect: false,
            },
            {
                text: 'input',
                isCorrect: false,
            },
        ],
        lastModification: '2024-01-31T16:09:01.684Z',
    },
    {
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
        id: 'e6547406-2543-4683-b0a2-dc0f1b01df66',
        lastModification: '2023-01-31T16:39:55.649Z',
    },
    {
        id: '9a9010c6-65d2-4370-b78e-c4211bb86eb9',
        lastModification: '2023-02-02T15:28:59.795Z',
        title: 'Quiz 1',
        description: 'quiz',
        duration: 40,
        questions: [
            {
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
                id: 'e6547406-2543-4683-b0a2-dc0f1b01df66',
                lastModification: '2022-01-31T16:39:55.649Z',
            },
        ],
        isHidden: true,
    },
];

describe('Questions Service', () => {
    let questionsService: QuestionsService;
    let readFileStub: sinon.SinonStub;
    let writeFileStub: sinon.SinonStub;

    beforeEach(() => {
        readFileStub = sinon.stub(fs, 'readFile').resolves(JSON.stringify(QUESTIONS)); // Stub readFile to return an empty array initially
        writeFileStub = sinon.stub(fs, 'writeFile').resolves(); // Stub writeFile to resolve without doing anything

        questionsService = new QuestionsService();
    });

    afterEach(() => {
        readFileStub.restore();
        writeFileStub.restore();
    });

    describe('getAllQuestions', () => {
        it('should return an empty array if no questions are present', async () => {
            const questions = await questionsService.getAllQuestions();
            expect(questions).to.be.an('array');
            expect(questions).to.have.lengthOf(3);
        });

        // Add more test cases as needed
    });

    describe('sortAllQuestions', () => {
        it('should return sorted questions by lastModification date', async () => {
            readFileStub.resolves(JSON.stringify(QUESTIONS));

            const sortedQuestions = await questionsService.sortAllQuestions();
            expect(sortedQuestions).to.deep.equal([QUESTIONS[2], QUESTIONS[1], QUESTIONS[0]]);
        });

        // Add more test cases as needed
    });

    describe('addQuestion', () => {
        it('should add a new question to the list', async () => {
            const question = {
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
            } as unknown as Question;

            await questionsService.addQuestion(question);
            const updatedQuestions = JSON.parse(writeFileStub.args[0][1]);
            expect(updatedQuestions).to.deep.include(question);
        });
    });

    describe('deleteQuestionByID', () => {
        it('should delete the question with the given ID', async () => {
            const questionIdToDelete = '1';
            const existingQuestions = [
                { id: '1', lastModification: '2022-01-01T00:00:00.000Z' },
                { id: '2', lastModification: '2023-01-01T00:00:00.000Z' },
            ];
            readFileStub.resolves(JSON.stringify(existingQuestions));

            const result = await questionsService.deleteQuestionByID(questionIdToDelete);
            expect(result).to.equal(true);
            const updatedQuestions = JSON.parse(writeFileStub.args[0][1]);
            expect(updatedQuestions).to.not.deep.include({ id: questionIdToDelete });
        });

        // Add more test cases as needed
    });
});
