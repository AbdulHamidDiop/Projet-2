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
        res.json(await this.questionsService.getAllQuestions());
        res.status(HTTP_STATUS_OK);
    });
    }
}