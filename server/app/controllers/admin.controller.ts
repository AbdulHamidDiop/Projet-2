import { AdminService } from '@app/services/admin.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

const HTTP_STATUS_OK = 200;

@Service()
export class AdminController {
    router: Router;

    constructor(private readonly adminService: AdminService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

    /**
         * @swagger
         *
         * /api/admin:
         *   get:
         *     description: Return quiz
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
        res.json(await this.adminService.getAllGames());
        res.status(HTTP_STATUS_OK);
    });

        
       /**
         * @swagger
         *
         * /api/admin/password:
         *   post:
         *     description: Check admin password
         *     tags:
         *       - Admin
         *     requestBody:
         *         description: password object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               type: string
         *             example:
         *               password: LOF2990-312
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
         */
        this.router.post('/password', (req: Request, res: Response) => {
            res.json(this.adminService.checkPassword(req.body.password));
            res.status(HTTP_STATUS_OK);
        });

/**
         * @swagger
         *
         * /api/admin/togglehidden:
         *   patch:
         *     description: Toggle game isHidden
         *     tags:
         *       - Admin
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
         *      
         */
        this.router.patch('/togglehidden', (req: Request, res: Response) => {
            res.json(this.adminService.toggleHidden(req.body.id));
            res.status(HTTP_STATUS_OK);
        });

    /**
         * @swagger
         *
         * /api/admin/deletegame:
         *   post:
         *     description: Delete game from database
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
    this.router.post('/deletegame', (req: Request, res: Response) => {
        res.json(this.adminService.deleteGameByID(req.body.id));
        res.status(HTTP_STATUS_OK);
    });
    }
}