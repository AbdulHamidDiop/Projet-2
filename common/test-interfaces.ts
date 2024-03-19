import { Choices, Game, Question, Type } from '@common/game';
export const validChoices: Choices[] = [
    {
        text: 'Choix valide #1',
        isCorrect: true,

        index: 0,
    },
    {
        text: 'Choix valide #2',
        isCorrect: false,

        index: 0,
    },
];
export const validQuestion: Question = {
    id: '2',
    lastModification: null,
    type: Type.QCM,
    text: 'Question valide',
    points: 10,
    choices: [
        {
            text: 'Choix valide #1',
            isCorrect: true,

            index: 0,
        },
        {
            text: 'Choix valide #2',
            isCorrect: false,

            index: 0,
        },
    ],
    answer: 'Choix #1',
};

export const validGame: Game = {
    id: '0',
    lastModification: new Date(),
    title: 'Jeu standard',
    description: 'Description valide',
    duration: 10,
    questions: [
        {
            id: '2',
            type: Type.QCM,
            text: 'Question valide',
            points: 10,
            choices: [
                {
                    text: 'Choix valide #1',
                    isCorrect: true,

                    index: 0,
                },
                {
                    text: 'Choix valide #2',
                    isCorrect: false,

                    index: 0,
                },
            ],
            lastModification: null,
            answer: 'Choix #1',
        },
        {
            id: '1',
            type: Type.QCM,
            text: 'Question valide',
            points: 10,
            choices: [
                {
                    text: 'Choix valide #1',
                    isCorrect: true,

                    index: 0,
                },
                {
                    text: 'Choix valide #2',
                    isCorrect: false,

                    index: 0,
                },
            ],
            lastModification: null,
            answer: 'Choix #1',
        },
        {
            id: '0',
            type: Type.QCM,
            text: 'Question valide',
            points: 10,
            choices: [
                {
                    text: 'Choix valide #1',
                    isCorrect: true,

                    index: 0,
                },
                {
                    text: 'Choix valide #2',
                    isCorrect: false,

                    index: 0,
                },
            ],
            lastModification: null,
            answer: 'Choix #1',
        },
        {
            id: '3',
            type: Type.QCM,
            text: 'Question valide',
            points: 10,
            choices: [
                {
                    text: 'Choix valide #1',
                    isCorrect: true,

                    index: 0,
                },
                {
                    text: 'Choix valide #2',
                    isCorrect: false,

                    index: 0,
                },
            ],
            lastModification: null,
            answer: 'Choix #1',
        },
    ],
};
