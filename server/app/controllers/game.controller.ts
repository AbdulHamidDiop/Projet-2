import { GamesService } from '@app/services/games.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;

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
         * /api/game/togglehidden/:
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
            res.status(HTTP_STATUS_OK);
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
            res.status(HTTP_STATUS_OK);
        });
    }
}
