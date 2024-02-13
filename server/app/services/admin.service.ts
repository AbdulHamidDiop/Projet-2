import { Service } from 'typedi';

const PASSWORD = 'log2990-312';

@Service()
export class AdminService {
    checkPassword(password: string): boolean {
        return password === PASSWORD;
    }
}
