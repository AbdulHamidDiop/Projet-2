import { Application } from '@app/app';
import { AdminService } from '@app/services/admin.service';
import { StatusCodes } from 'http-status-codes';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import supertest from 'supertest';
import { Container } from 'typedi';

describe('AdminController', () => {
    let adminService: SinonStubbedInstance<AdminService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        adminService = createStubInstance(AdminService);
        const app = Container.get(Application);
        Object.defineProperty(app['adminController'], 'adminService', { value: adminService });
        expressApp = app.app;
    });

    it('should return OK for correct password', async () => {
        const password = 'password';
        adminService.checkPassword.returns(true);
        return supertest(expressApp).post('/api/admin/password').send(password).set('Content', 'application/json').expect(StatusCodes.OK);
    });

    it('should return UNAUTHORIZED for incorrect password', async () => {
        const password = 'wrongpassword';
        adminService.checkPassword.returns(false);
        return supertest(expressApp).post('/api/admin/password').send(password).set('Content', 'application/json').expect(StatusCodes.UNAUTHORIZED);
    });
});
