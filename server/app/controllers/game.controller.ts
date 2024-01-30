import { GamesService } from '@app/services/games.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

const HTTP_STATUS_OK = 200;

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
         *             $ref: '#/definitions/Message'
         */
        this.router.get('/', async (req: Request, res: Response) => {
            res.json(await this.gamesService.getAllGames());
            res.status(HTTP_STATUS_OK);
        });

        /**
         * @swagger
         *
         * /api/game/importgame:
         *   post:
         *     description: Import new game
         *     tags:
         *       - Game
         *     requestBody:
         *         description: password object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               type: object   # Change type to object
         *               properties:
         *                 game:         # Indentation fixed here
         *                   type: object
         *                   properties:
         *                     id:
         *                       type: string
         *                     title:
         *                       type: string
         *                     description:
         *                       type: string
         *                     duration:
         *                       type: integer
         *                     lastModification:
         *                       type: string
         *                     isHidden:
         *                       type: boolean
         *                     questions:
         *                       type: array
         *                       items:
         *                         type: object
         *                         properties:
         *                           type:
         *                             type: string
         *                           text:
         *                             type: string
         *                           points:
         *                             type: integer
         *                           choices:
         *                             type: array
         *                             items:
         *                               type: object
         *                               properties:
         *                                 text:
         *                                   type: string
         *                                 isCorrect:
         *                                   type: boolean
         *               example:
         *                 game:
         *                   id: "tester"
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
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
         */

        this.router.post('/importgame', (req: Request, res: Response) => {
            res.json(this.gamesService.addGame(req.body.game));
            res.status(HTTP_STATUS_OK);
        });

        /**
         * @swagger
         *
         * /api/game/46277881345 :
         *   get:
         *     description: Get game by ID
         *     tags:
         *       - Game
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         description: quiz or null
         *         schema:
         *           type: Game
         */
        this.router.get('/:id', async (req: Request, res: Response) => {
            res.json(await this.gamesService.getGameByID(req.params.id));
            res.status(HTTP_STATUS_OK);
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
         *               id: 1a2b3c
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: OK
         */
        this.router.patch('/togglehidden', (req: Request, res: Response) => {
            res.json(this.gamesService.toggleGameHidden(req.body.id));
            res.status(HTTP_STATUS_OK);
        });

        /**
         * @swagger
         *
         * /api/game/deletegame:
         *   post:
         *     description: Delete game from database
         *     tags:
         *       - Game
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
         */
        this.router.delete('/deletegame/:id', (req: Request, res: Response) => {
            res.json(this.gamesService.deleteGameByID(req.params.id));
            res.status(HTTP_STATUS_OK);
        });
    }
}
