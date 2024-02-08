export const FIRST_QUIZ = {
    id: '462778813469',
    title: 'Trivia des top 50 artistes des années 2000',
    description: 'Questaqions de pratique sur le langage JavaScript',
    duration: 60,
    lastModification: '2024-02-02T17:56:00.555Z',
    isHidden: true,
    questions: [
        {
            type: 'QCM',
            text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
            points: 40,
            choices: [
                {
                    text: 'var',
                    isCorrect: true,
                },
                {
                    text: 'self',
                    isCorrect: false,
                },
                {
                    text: 'this',
                    isCorrect: true,
                },
                {
                    text: 'int',
                },
            ],
        },
        {
            type: 'QCM',
            text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
            points: 20,
            choices: [
                {
                    text: 'Non',
                    isCorrect: true,
                },
                {
                    text: 'Oui',
                    isCorrect: false,
                },
            ],
        },
    ],
};

export const TEST_QUIZ = {
    id: '00000000-1111-2222-test-000000000000',
    lastModification: '2024-02-02T15:28:59.795Z',
    title: 'test',
    description: 'test',
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
            lastModification: '2024-01-25T16:09:35.649Z',
        },
    ],
    isHidden: true,
};
