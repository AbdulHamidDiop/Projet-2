import { PlayerService } from '@app/services/player.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { StatusCodes } from 'http-status-codes';
import { Player } from '@common/game';

@Service()
export class PlayerController {
    router: Router;

    constructor(private readonly playerService: PlayerService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * /api/players:
         *   get:
         *     description: Get all players
         *     tags:
         *       - Players
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: OK
         */
        this.router.get('/players', (req: Request, res: Response) => {
            const players = this.playerService.getAllPlayers();
            res.json(players);
        });

        /**
         * @swagger
         *
         * /api/players:
         *   post:
         *     description: Add a new player
         *     tags:
         *       - Players
         *     requestBody:
         *         description: Player object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Player'
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
         */
        this.router.post('/players', (req: Request, res: Response) => {
            const player: Player = req.body;
            this.playerService.addPlayer(player);
            res.status(StatusCodes.CREATED).send();
        });

        /**
         * @swagger
         *
         * /api/players/{id}:
         *   get:
         *     description: Get a player by ID
         *     tags:
         *       - Players
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: OK
         *       404:
         *         description: Not Found
         */
        this.router.get('/players/:id', (req: Request, res: Response) => {
            const player = this.playerService.getPlayerById(req.params.id);
            if (player) {
                res.json(player);
            } else {
                res.status(StatusCodes.NOT_FOUND).send();
            }
        });

        /**
         * @swagger
         *
         * /api/players/{id}:
         *   put:
         *     description: Update a player
         *     tags:
         *       - Players
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     requestBody:
         *         description: Player object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Player'
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: OK
         */
        this.router.put('/players/:id', (req: Request, res: Response) => {
            const player: Player = req.body;
            this.playerService.updatePlayer(player);
            res.status(StatusCodes.OK).send();
        });

        /**
         * @swagger
         *
         * /api/players/{id}:
         *   delete:
         *     description: Remove a player
         *     tags:
         *       - Players
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: OK
         */
        this.router.delete('/players/:id', (req: Request, res: Response) => {
            this.playerService.removePlayer(req.params.id);
            res.status(StatusCodes.OK).send();
        });

        /**
         * @swagger
         *
         * /api/game/send-choice:
         *   post:
         *     description: Send player's choice for a question
         *     tags:
         *       - Game
         *     requestBody:
         *         description: Player's choice and question
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 choice:
         *                   $ref: '#/components/schemas/Choices'
         *                 question:
         *                   $ref: '#/components/schemas/Question'
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: OK
         *       400:
         *         description: Bad Request
         */
        this.router.post('players/choice', (req: Request, res: Response) => {
            const { choice, question } = req.body;

            this.playerService.updateChoice(choice, question);

            res.status(StatusCodes.OK).send();
        });
    }
}
