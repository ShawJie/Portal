import { AccessUser } from './context';

declare global {
    namespace Express {
        interface Request {
            accessUser?: AccessUser;
        }
    }
}
