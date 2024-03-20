import { GameSessionService } from '@app/services/game-session.service';
import { GameSession } from '@common/game-session';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameSessionController {
    router: Router;

    constructor(private readonly gameSessionService: GameSessionService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * /api/gameSession:
         *   get:
         *     description: Return all sessions
         *     tags:
         *       - Game
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         description: All sessions
         */
        this.router.get('/', async (req: Request, res: Response) => {
            res.json(await this.gameSessionService.getAllSessions());
            res.status(StatusCodes.OK);
            res.send();
        });

        /**
         * @swagger
         *
         * /api/gameSession/{pin}:
         *   get:
         *     description: Get game session by pin
         *     tags:
         *       - GameSession
         *     parameters:
         *       - in: path
         *         name: pin
         *         required: true
         *         description: The pin of the session to get
         *         schema:
         *           type: string
         *         example: "test"
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Successful response
         */

        this.router.get('/:pin', async (req: Request, res: Response) => {
            const session: GameSession = await this.gameSessionService.getSessionByPin(req.params.pin);
            if (session === null) {
                res.status(StatusCodes.NOT_FOUND);
            } else {
                res.status(StatusCodes.OK);
                res.json(session);
            }
            res.send();
        });

        /**
         * @swagger
         * /api/gameSession/create/{pin}:
         *  post:
         *   description: Create a new game session
         *   tags:
         *   - GameSession
         *   parameters:
         *   - in: path
         *     name: pin
         *     required: true
         *     description: The pin of the session to create
         *     schema:
         *       type: string
         *       example: "test"
         * requestBody:
         * required: true
         */
        this.router.post('/create/:pin', async (req: Request, res: Response) => {
            const game = req.body;
            const session = await this.gameSessionService.createSession(req.params.pin, game);
            res.status(StatusCodes.OK);
            res.json(session);
        });

        /**
         * @swagger
         *
         * /api/gameSession/delete/{pin}:
         *   delete:
         *     description: Delete game session from database
         *     tags:
         *       - GameSession
         *     parameters:
         *       - in: path
         *         name: pin
         *         required: true
         *         description: The pin of the session to delete
         *         schema:
         *           type: string
         *         example: "test"
         *     responses:
         *       200:
         *         description: OK
         */
        this.router.delete('/delete/:pin', async (req: Request, res: Response) => {
            await this.gameSessionService.deleteSession(req.params.pin);
            res.status(StatusCodes.OK);
            res.send();
        });

        // make one for getting game by pin
        /**
         * @swagger
         *
         * /api/gameSession/game/{pin}:
         *   get:
         *     description: Get game by pin
         *     tags:
         *       - GameSession
         *     parameters:
         *       - in: path
         *         name: pin
         *         required: true
         *         description: The pin of the session to get
         *         schema:
         *           type: string
         *         example: "test"
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Successful response
         */
        this.router.get('/game/:pin', async (req: Request, res: Response) => {
            const game = await this.gameSessionService.getGameByPin(req.params.pin);
            res.status(StatusCodes.OK);
            res.json(game);
        });

        /**
         * @swagger
         *
         * /api/gameSession/questionswithoutcorrect/{pin}:
         *   get:
         *     description: Get game questions without correct answers
         *     tags:
         *       - GameSession
         *     parameters:
         *       - in: path
         *         name: pin
         *         required: true
         *         description: The pin of the session to get
         *         schema:
         *           type: string
         *         example: "test"
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Successful response
         */
        this.router.get('/questionswithoutcorrect/:pin', async (req: Request, res: Response) => {
            res.status(StatusCodes.OK).json(await this.gameSessionService.getQuestionsWithoutCorrectShown(req.params.pin));
        });

        /**
         * @swagger
         *
         * /api/gameSession/check:
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
            const { answer, sessionPin, questionID } = req.body;
            const isCorrect = await this.gameSessionService.isCorrectAnswer(answer, sessionPin, questionID);
            res.status(StatusCodes.OK).json({ isCorrect });
        });

        /**
         * @swagger
         *
         * /api/gameSession/feedback:
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
            const { sessionPin, questionID, submittedAnswers } = req.body;

            if (!questionID || !submittedAnswers || !sessionPin) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'Question ID and submitted answers are required.' });
            } else {
                const feedback = await this.gameSessionService.generateFeedback(sessionPin, questionID, submittedAnswers);
                res.status(StatusCodes.OK);
                res.json(feedback);
            }
            res.send();
        });
    }
}
