import { QuestionsService } from '@app/services/questions.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

const HTTP_STATUS_OK = 200;

@Service()
export class QuestionsController {
    router: Router;

    constructor(private readonly questionsService: QuestionsService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * /api/questions:
         *   get:
         *     summary: Get all questions
         *     description: Return all questions sorted by date of modification
         *     tags:
         *       - Question
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         description: All questions
         *         schema:
         *           type: array
         *           items:
         *             $ref: '#/components/schemas/Question'
         */
        this.router.get('/', async (req: Request, res: Response) => {
            res.json(await this.questionsService.sortAllQuestions());
            res.status(HTTP_STATUS_OK);
        });

        /**
         * @swagger
         *
         * /api/questions/test:
         *   get:
         *     summary: Get the questions without the attribute isCorrect
         *     description: Return all questions sorted by date of modification and without showing which answer(s) is(are) correct on the client side
         *     tags:
         *       - Question
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         description: All questions without the correct answer shown
         *         schema:
         *           type: array
         *           items:
         *             $ref: '#/components/schemas/Question'
         */
        this.router.get('/test', async (req: Request, res: Response) => {
            res.json(await this.questionsService.sortQuestionsWithoutCorrectShown());
            res.status(HTTP_STATUS_OK);
        });

        /**
         * @swagger
         *
         * /api/questions/add:
         *   post:
         *     summary: Add a question
         *     tags:
         *       - Question
         *     requestBody:
         *         description: Question to add
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Question/choice'
         *             example:
         *               id: "test"
         *               type: "QCM"
         *               text: "Quelle est la capitale de France?"
         *               points: 10
         *               choices:
         *                 - text: "Paris"
         *                   isCorrect: true
         *                 - text: "Berlin"
         *                   isCorrect: false
         *                 - text: "London"
         *                   isCorrect: false
         *
         */
        this.router.post('/add', (req: Request, res: Response) => {
            res.json(this.questionsService.addQuestion(req.body));
            res.status(HTTP_STATUS_OK);
        });


         /**
         * @swagger
         *
         * /api/questions/check:
         *   post:
         *     summary: Check if an answer is correct
         *     tags:
         *       - Question
         *     requestBody:
         *         description: Choice
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Question'
         *             example:
         *               
         *
         */
         this.router.post('/check', (req: Request, res: Response) => {
            const userChoice = req.body.choice;
            const question = req.body.question;
            const isCorrect = this.questionsService.isCorrectAnswer(userChoice, question);
            res.json({ isCorrect });
            res.status(HTTP_STATUS_OK);
        });


        /**
         * @swagger
         *
         * /api/questions/edit:
         *   put:
         *     summary: Modify a question
         *     tags:
         *       - Question
         *     requestBody:
         *         description: modified question
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Game'
         *             example:
         *               id: "test"
         *               type: "QCM"
         *               text: "Quelle est la capitale de France?"
         *               points: 30
         *               choices:
         *                 - text: "Paris"
         *                   isCorrect: true
         *                 - text: "Berlin"
         *                   isCorrect: false
         *                 - text: "London"
         *                   isCorrect: false
         *
         */
        this.router.put('/edit', (req: Request, res: Response) => {
            res.json(this.questionsService.addQuestion(req.body));
            res.status(HTTP_STATUS_OK);
        });

        /**
         * @swagger
         *
         * /api/questions/delete/{id}:
         *   delete:
         *     description: Delete question from database
         *     tags:
         *       - Question
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: The ID of the question to delete
         *         schema:
         *           type: string
         *         example: "test"
         *     responses:
         *       200:
         *         description: OK
         *
         */
        this.router.delete('/delete/:id', (req: Request, res: Response) => {
            res.json(this.questionsService.deleteQuestionByID(req.params.id));
            res.status(HTTP_STATUS_OK);
        });
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Game:
 *       type: object
 *       properties:
 *         game:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: The unique identifier for the game
 *             title:
 *               type: string
 *               description: The title of the game
 *             description:
 *               type: string
 *               description: The description of the game
 *             duration:
 *               type: integer
 *               description: The duration of the game in minutes
 *             lastModification:
 *               type: string
 *               description: The last modification timestamp of the game
 *             isHidden:
 *               type: boolean
 *               description: Indicates if the game is hidden
 *             questions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *
 *
 *     Question:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the question
 *         type:
 *           type: string
 *           description: The type of the question
 *         text:
 *           type: string
 *           description: The text of the question
 *         points:
 *           type: integer
 *           description: The points assigned to the question
 *         choices:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Choice'
 *           description: The array of choices for the question
 *
 *     Choice:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           description: The text of the choice
 *         isCorrect:
 *           type: boolean
 *           description: Indicates if the choice is correct
 */
