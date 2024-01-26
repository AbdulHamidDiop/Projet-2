import { Message } from '@common/message';
import { Service } from 'typedi';

const PASSWORD = 'LOG2990-312';

@Service()
export class AdminService {
    checkPassword(password: string): Message {
        return {
            title: 'Correct Password',
            body: (password === PASSWORD).toString(),
        };
    }
}
