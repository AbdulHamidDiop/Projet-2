import { AdminService } from '@app/services/admin.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

import { StatusCodes } from 'http-status-codes';
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
         *               password: LOG2990-312
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
         */
        this.router.post('/password', (req: Request, res: Response) => {
            if (this.adminService.checkPassword(req.body.password)) {
                res.status(StatusCodes.OK);
                res.json(true);
            } else {
                res.status(StatusCodes.UNAUTHORIZED);
            }
            res.send();
        });
    }
}
