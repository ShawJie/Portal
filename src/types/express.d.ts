import { AccessUser } from './context';
import 'express-session';

declare global {
    namespace Express {
        interface Request {
            accessUser?: AccessUser;
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        adminUser?: string;
    }
}
