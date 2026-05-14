const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(body.message || res.statusText);
    }
    return res.json() as Promise<T>;
}

export interface SessionInfo {
    username: string;
}

export interface PortalConfig {
    host?: string;
    accessControl?: boolean;
    sourcePaths?: { name: string; url: string }[];
    logLevel?: string;
    refreshCron?: string;
    include?: string;
    exclude?: string;
    adminUsers?: string[];
}

export interface ProxyNode {
    name: string;
    type: string;
    server: string;
    port: number;
}

export const api = {
    login: (username: string, password: string) =>
        request<SessionInfo>('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),

    logout: () =>
        request<{ message: string }>('/logout', { method: 'POST' }),

    session: () =>
        request<SessionInfo>('/session'),

    getConfig: () =>
        request<PortalConfig>('/config'),

    getProxies: () =>
        request<ProxyNode[]>('/proxies'),

    getGroups: () =>
        request<unknown[]>('/groups'),

    getCustomProxys: () =>
        request<unknown[]>('/custom-proxys'),
};
