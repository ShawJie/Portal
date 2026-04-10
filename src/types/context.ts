export interface AccessUser {
    username: string;
    password: string;
}

export interface ConvertContext {
    accessUser?: AccessUser;
    query: Record<string, string>;
    ua: string;
}
