import { ADMIN_PASSWORD } from '@common/consts';
import { Service } from 'typedi';

@Service()
export class AdminService {
    checkPassword(password: string): boolean {
        return password === ADMIN_PASSWORD;
    }
}
