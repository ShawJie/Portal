import type { Request, Response } from 'express';
import { RequestHandler } from './RequestHandlerChain';
import app from '../App';
import configPersistence from '../config/ConfigPersistence';
import { defaultGroups } from '../entry/Grouper';
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

class GetBuiltinGroupsHandler extends RequestHandler {
    async handle(_req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        const groupNames = defaultGroups.map(g => g.name);
        res.json(groupNames);
    }
}

class GetCustomProxysHandler extends RequestHandler {
    async handle(_req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        res.json(configPersistence.readProxys());
    }
}

class FetchRulesHandler extends RequestHandler {
    async handle(req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        const { url } = req.body as { url: string };
        if (!url) {
            res.status(400).json({ message: 'URL is required' });
            return;
        }

        try {
            const { default: axios } = await import('axios');
            const response = await axios.get(url, { responseType: 'text' });
            const lines = (response.data as string).split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'));

            const rules = lines.map(line => {
                const idx = line.indexOf(',');
                if (idx === -1) return null;
                return { ruleType: line.substring(0, idx), keyword: line.substring(idx + 1) };
            }).filter((r): r is { ruleType: string; keyword: string } => r !== null);

            res.json(rules);
        } catch (err) {
            adminLogger.error('Failed to fetch rules from %s: %o', url, err);
            res.status(500).json({ message: 'Failed to fetch rules from URL' });
        }
    }
}

class SaveCustomProxysHandler extends RequestHandler {
    async handle(req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        const proxys = req.body as unknown[];
        if (!Array.isArray(proxys)) {
            res.status(400).json({ message: 'Invalid proxys body, expected array' });
            return;
        }

        try {
            configPersistence.writeProxys(proxys as import('../types/proxy').ClashProxy[]);
            await app.reloadData();
            adminLogger.info('Custom proxys saved by %s', req.session.adminUser);
            res.json({ message: 'Custom proxys saved' });
        } catch (err) {
            adminLogger.error('Failed to save custom proxys: %o', err);
            res.status(500).json({ message: 'Failed to save custom proxys' });
        }
    }
}

class SaveGroupsHandler extends RequestHandler {
    async handle(req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        const groups = req.body as unknown[];
        if (!Array.isArray(groups)) {
            res.status(400).json({ message: 'Invalid groups body, expected array' });
            return;
        }

        try {
            configPersistence.writeGroups(groups as import('../types/config').CustomGroupConfig[]);
            await app.reloadData();
            adminLogger.info('Groups saved by %s', req.session.adminUser);
            res.json({ message: 'Groups saved' });
        } catch (err) {
            adminLogger.error('Failed to save groups: %o', err);
            res.status(500).json({ message: 'Failed to save groups' });
        }
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
            { path: '/api/builtin-groups', method: 'get', handler: new GetBuiltinGroupsHandler() },
            { path: '/api/fetch-rules', method: 'post', handler: new FetchRulesHandler() },
            { path: '/api/groups', method: 'get', handler: new GetGroupsHandler() },
            { path: '/api/groups', method: 'post', handler: new SaveGroupsHandler() },
            { path: '/api/custom-proxys', method: 'get', handler: new GetCustomProxysHandler() },
            { path: '/api/custom-proxys', method: 'post', handler: new SaveCustomProxysHandler() },
        ];
    }
}
