const BASE = (import.meta.env.VITE_BASE_PATH || '') + '/api';

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

export interface CustomProxy {
    name: string;
    server: string;
    [key: string]: unknown;
}

export interface ProxyRule {
    ruleType: string;
    keyword: string;
}

export interface CustomGroup {
    groupName: string;
    type: string;
    attachGroup?: string[];
    proxys?: string;
    rules?: ProxyRule[];
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

    saveConfig: (config: PortalConfig) =>
        request<{ message: string; refreshed: boolean }>('/config', {
            method: 'POST',
            body: JSON.stringify(config),
        }),

    getProxies: () =>
        request<ProxyNode[]>('/proxies'),

    getGroups: () =>
        request<CustomGroup[]>('/groups'),

    getBuiltinGroups: () =>
        request<string[]>('/builtin-groups'),

    fetchRules: (url: string) =>
        request<ProxyRule[]>('/fetch-rules', {
            method: 'POST',
            body: JSON.stringify({ url }),
        }),

    saveGroups: (groups: CustomGroup[]) =>
        request<{ message: string }>('/groups', {
            method: 'POST',
            body: JSON.stringify(groups),
        }),

    getCustomProxys: () =>
        request<CustomProxy[]>('/custom-proxys'),

    saveCustomProxys: (proxys: CustomProxy[]) =>
        request<{ message: string }>('/custom-proxys', {
            method: 'POST',
            body: JSON.stringify(proxys),
        }),
};
