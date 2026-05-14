import type { Request, Response } from 'express';
import { RequestHandler } from './RequestHandlerChain';
import app from '../App';
import configPersistence from '../config/ConfigPersistence';
import logger from '../Logger';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

export interface AdminRoute {
    path: string;
    method: HttpMethod;
    handler: RequestHandler;
}

const adminLogger = logger.child({ module: 'AdminRouter' });

class LoginHandler extends RequestHandler {
    async handle(req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        const { username, password } = req.body as { username: string; password: string };
        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }

        if (!app.accessControl()) {
            res.status(403).json({ message: 'Access control is not enabled' });
            return;
        }

        if (!app.inAccessSet({ username, password })) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        if (!app.isAdminUser(username)) {
            res.status(403).json({ message: 'User is not an admin' });
            return;
        }

        req.session.adminUser = username;
        adminLogger.info('Admin user logged in: %s', username);
        res.json({ username });
    }
}

class LogoutHandler extends RequestHandler {
    async handle(req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        const username = req.session.adminUser;
        req.session.destroy((err) => {
            if (err) {
                adminLogger.error('Failed to destroy session: %o', err);
                res.status(500).json({ message: 'Logout failed' });
                return;
            }
            adminLogger.info('Admin user logged out: %s', username);
            res.json({ message: 'Logged out' });
        });
    }
}

class SessionHandler extends RequestHandler {
    async handle(req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        if (req.session.adminUser) {
            res.json({ username: req.session.adminUser });
        } else {
            res.status(401).json({ message: 'Not authenticated' });
        }
    }
}

class GetConfigHandler extends RequestHandler {
    async handle(_req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        res.json(configPersistence.readConfig());
    }
}

class GetProxiesHandler extends RequestHandler {
    async handle(_req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        res.json(app.getLoadedProxies());
    }
}

class GetGroupsHandler extends RequestHandler {
    async handle(_req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        res.json(configPersistence.readGroups());
    }
}

class GetCustomProxysHandler extends RequestHandler {
    async handle(_req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        res.json(configPersistence.readProxys());
    }
}

class SaveConfigHandler extends RequestHandler {
    async handle(req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        const newConfig = req.body as Record<string, unknown>;
        if (!newConfig || typeof newConfig !== 'object') {
            res.status(400).json({ message: 'Invalid config body' });
            return;
        }

        try {
            const oldConfig = configPersistence.readConfig();
            configPersistence.writeConfig(newConfig as import('../types/config').PortalConfig);

            const needRefresh =
                oldConfig.exclude !== newConfig.exclude ||
                oldConfig.include !== newConfig.include ||
                JSON.stringify(oldConfig.sourcePaths) !== JSON.stringify(newConfig.sourcePaths);

            await app.reloadProperty(newConfig as import('../types/config').PortalConfig, needRefresh);

            adminLogger.info('Config saved by %s, refresh: %s', req.session.adminUser, needRefresh);
            res.json({ message: 'Config saved', refreshed: needRefresh });
        } catch (err) {
            adminLogger.error('Failed to save config: %o', err);
            res.status(500).json({ message: 'Failed to save config' });
        }
    }
}

export default class AdminRouter {
    getRoutes(): AdminRoute[] {
        return [
            { path: '/api/login', method: 'post', handler: new LoginHandler() },
            { path: '/api/logout', method: 'post', handler: new LogoutHandler() },
            { path: '/api/session', method: 'get', handler: new SessionHandler() },
            { path: '/api/config', method: 'get', handler: new GetConfigHandler() },
            { path: '/api/config', method: 'post', handler: new SaveConfigHandler() },
            { path: '/api/proxies', method: 'get', handler: new GetProxiesHandler() },
            { path: '/api/groups', method: 'get', handler: new GetGroupsHandler() },
            { path: '/api/custom-proxys', method: 'get', handler: new GetCustomProxysHandler() },
        ];
    }
}
