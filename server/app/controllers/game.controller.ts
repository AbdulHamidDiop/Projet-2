/* eslint-disable max-lines */
import { GamesService } from '@app/services/games.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_NO_CONTENT = 204;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_BAD_REQUEST = 400;

@Service()
export class GameController {
    router: Router;

    constructor(private readonly gamesService: GamesService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * /api/game:
         *   get:
         *     description: Return quiz
         *     tags:
         *       - Game
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         description: All quizzes
         *         schema:
         *           type: array
         *           items:
         *             $ref: '#/components/schemas/Question'
         */
        this.router.get('/', async (req: Request, res: Response) => {
            res.json(await this.gamesService.getAllGames());
            res.status(HTTP_STATUS_OK);
        });

        /**
         * @swagger
         *
         * /api/game/importgame :
         *   post:
         *     description: Import new game
         *     tags:
         *       - Game
         *     requestBody:
         *       description: Request body for importing a new game
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/Game'
         *           example:
         *                   id: "test"
         *                   title: "Questionnaire sur le JS"
         *                   description: "Questions de pratique sur le langage JavaScript"
         *                   duration: 60
         *                   lastModification: "2024-01-19T20:55:10.186Z"
         *                   questions:
         *                     - type: "QCM"
         *                       text: "Parmi les mots suivants, lesquels sont des mots clés réservés en JS?"
         *                       points: 40
         *                       choices:
         *                         - text: "var"
         *                           isCorrect: true
         *                         - text: "self"
         *                           isCorrect: false
         *                         - text: "this"
         *                           isCorrect: true
         *                         - text: "int"
         *                     - type: "QRL"
         *                       text: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?"
         *                       points: 60
         *                     - type: "QCM"
         *                       text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? "
         *                       points: 20
         *                       choices:
         *                         - text: "Non"
         *                           isCorrect: true
         *                         - text: "Oui"
         *                           isCorrect: null
         *     responses:
         *       201:
         *         description: Created
         */

        this.router.post('/importgame', (req: Request, res: Response) => {
            res.json(this.gamesService.addGame(req.body));
            res.status(HTTP_STATUS_CREATED);
        });

        /**
         * @swagger
         *
         * /api/game/edit :
         *   put:
         *     description: Edit existing game
         *     tags:
         *       - Game
         *     requestBody:
         *       description: Request body for changing game
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/Game'
         *           example:
         *                 game:
         *                   id: "test"
         *                   title: "Questionnaire sur le Python"
         *                   description: "Questions de pratique sur le langage Python"
         *                   duration: 60
         *                   lastModification: "2024-01-19T20:55:10.186Z"
         *                   questions:
         *                     - type: "QCM"
         *                       text: "Parmi les mots suivants, lesquels sont des mots clés réservés en Python?"
         *                       points: 40
         *                       choices:
         *                         - text: "var"
         *                           isCorrect: true
         *                         - text: "self"
         *                           isCorrect: false
         *                         - text: "this"
         *                           isCorrect: true
         *                         - text: "int"
         *                     - type: "QRL"
         *                       text: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en Python ?"
         *                       points: 60
         *                     - type: "QCM"
         *                       text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? "
         *                       points: 20
         *                       choices:
         *                         - text: "Non"
         *                           isCorrect: true
         *                         - text: "Oui"
         *                           isCorrect: null
         *     responses:
         *       200:
         *         description: OK
         */

        this.router.put('/edit', (req: Request, res: Response) => {
            res.json(this.gamesService.addGame(req.body.game));
            res.status(HTTP_STATUS_OK);
        });

        /**
         * @swagger
         *
         * /api/game/{id}:
         *   get:
         *     description: Get game by ID
         *     tags:
         *       - Game
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: The ID of the game to get
         *         schema:
         *           type: string
         *         example: "test"
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Successful response
         */

        this.router.get('/:id', async (req: Request, res: Response) => {
            res.status(HTTP_STATUS_OK).json(await this.gamesService.getGameByID(req.params.id));
        });

        /**
         * @swagger
         *
         * /api/game/togglehidden:
         *   patch:
         *     description: Toggle game isHidden
         *     tags:
         *       - Game
         *     requestBody:
         *         description: Game ID
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *             example:
         *               id: test
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: OK
         */
        this.router.patch('/togglehidden', (req: Request, res: Response) => {
            res.json(this.gamesService.toggleGameHidden(req.body.id));
            res.status(HTTP_STATUS_NO_CONTENT);
        });

        /**
         * @swagger
         *
         * /api/game/deletegame/{id}:
         *   delete:
         *     description: Delete game from database
         *     tags:
         *       - Game
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: The ID of the game to delete
         *         schema:
         *           type: string
         *         example: "test"
         *     responses:
         *       200:
         *         description: OK
         */
        this.router.delete('/deletegame/:id', (req: Request, res: Response) => {
            res.json(this.gamesService.deleteGameByID(req.params.id));
            res.status(HTTP_STATUS_NO_CONTENT);
        });

        /**
         * @swagger
         *
         * /api/game/questionswithoutcorrect/{id}:
         *   get:
         *     description: Get game questions without correct answers
         *     tags:
         *       - Game
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: The ID of the game to get
         *         schema:
         *           type: string
         *         example: "test"
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Successful response
         */
        this.router.get('/questionswithoutcorrect/:id', async (req: Request, res: Response) => {
            res.status(HTTP_STATUS_OK).json(await this.gamesService.getQuestionsWithoutCorrectShown(req.params.id));
        });

        /**
         * @swagger
         *
         * /api/questions/check:
         *   post:
         *     summary: Check if an answer is correct
         *     tags:
         *       - Question
         *     description: Check whether the provided answer to a question is correct.
         *     requestBody:
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               required:
         *                 - answer
         *                 - gameID
         *                 - questionID
         *               properties:
         *                 answer:
         *                   type: array
         *                   items:
         *                     type: string
         *                   description: The user's answer(s) to the question.
         *                 gameID:
         *                   type: string
         *                   description: The unique identifier for the game session.
         *                 questionID:
         *                   type: string
         *                   description: The unique identifier for the question being answered.
         *             example:
         *               answer: ["Choice1", "Choice2"]
         *               gameID: "game123"
         *               questionID: "question456"
         *     responses:
         *       200:
         *         description: A boolean value indicating if the answer is correct.
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 isCorrect:
         *                   type: boolean
         *             example:
         *               isCorrect: true
         *       400:
         *         description: Bad request if the request body does not contain the required fields.
         */

        this.router.post('/check', async (req, res) => {
            const { answer, gameID, questionID } = req.body;
            const isCorrect = await this.gamesService.isCorrectAnswer(answer, gameID, questionID);
            res.status(HTTP_STATUS_OK).json({ isCorrect });
        });

        /**
         * @swagger
         *
         * /api/feedback:
         *   post:
         *     description: Submit answers for a question in a game and receive feedback
         *     tags:
         *       - Feedback
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - gameID
         *               - questionId
         *               - submittedAnswers
         *             properties:
         *               gameID:
         *                 type: string
         *                 description: The unique identifier of the game.
         *               questionId:
         *                 type: string
         *                 description: The unique identifier of the question being answered.
         *               submittedAnswers:
         *                 type: array
         *                 items:
         *                   type: string
         *                 description: An array of submitted answers.
         
         */
        this.router.post('/feedback', async (req, res) => {
            try {
                const { gameID, questionID, submittedAnswers } = req.body;

                if (!questionID || !submittedAnswers || !gameID) {
                    return res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Question ID and submitted answers are required.' });
                }

                const feedback = await this.gamesService.generateFeedback(gameID, questionID, submittedAnswers);
                res.json(feedback);
            } catch (error) {
                res.status(HTTP_STATUS_NOT_FOUND).json({ message: error.message });
                return { message: error.message };
            }

            return { message: 'err' };
        });
                /**
         * @swagger
         *
         * /api/game/{id}:
         *   get:
         *     description: Get game by ID
         *     tags:
         *       - Game
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: The ID of the game to get
         *         schema:
         *           type: string
         *         example: "test"
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Successful response
         */

        this.router.get('/availability/:id', async (req: Request, res: Response) => {
            res.status(HTTP_STATUS_OK).json(await this.gamesService.getGameByID(req.params.id));
        });
    }
}
