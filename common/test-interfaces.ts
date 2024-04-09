import { Choices, Game, Question, Type } from '@common/game';
export const VALID_CHOICES: Choices[] = [
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
export const VALID_QUESTION: Question = {
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
    ]
};

export const VALID_GAME: Game = {
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
        },
    ],
};
