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
         * /api/admin/questions:
         *   get:
         *     description: Return questions
         *     tags:
         *       - Admin
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         description: All quizzes
         *         schema:
         *           type: array
         *           items:
         *             $ref: '#/definitions/Message'
         */
        this.router.get('/', async (req: Request, res: Response) => {
            res.json(await this.questionsService.sortAllQuestions());
            res.status(HTTP_STATUS_OK);
        });

        /**
         * @swagger
         *
         * /api/admin/questions:
         *   post:
         *     description: Delete question from database
         *     tags:
         *       - Admin
         *     requestBody:
         *         description: Game ID
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               type: string
         *             example:
         *               id: 1a2b4c
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: OK
         *
         */
        this.router.delete('/deletequestion/:id', (req: Request, res: Response) => {
            res.json(this.questionsService.deleteQuestionByID(req.params.id));
            res.status(HTTP_STATUS_OK);
        });
    }
}
