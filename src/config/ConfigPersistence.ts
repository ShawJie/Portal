import fs from 'fs';
import logger from '../Logger';
import type { PortalConfig, CustomGroupConfig } from '../types/config';
import type { ClashProxy } from '../types/proxy';

const CONFIG_PATH = "config.json";
const PROXYS_PATH = "data/proxys.json";
const GROUPS_PATH = "data/groups.json";

class ConfigPersistence {

    private configLogger = logger.child({ module: "ConfigPersistence" });

    readConfig(): PortalConfig {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8")) as PortalConfig;
    }

    writeConfig(config: PortalConfig): void {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), "utf-8");
        this.configLogger.info('config.json updated');
    }

    readProxys(): ClashProxy[] {
        return this.readJsonArray<ClashProxy>(PROXYS_PATH);
    }

    writeProxys(proxys: ClashProxy[]): void {
        fs.writeFileSync(PROXYS_PATH, JSON.stringify(proxys, null, 4), "utf-8");
        this.configLogger.info('proxys.json updated');
    }

    readGroups(): CustomGroupConfig[] {
        return this.readJsonArray<CustomGroupConfig>(GROUPS_PATH);
    }

    writeGroups(groups: CustomGroupConfig[]): void {
        fs.writeFileSync(GROUPS_PATH, JSON.stringify(groups, null, 4), "utf-8");
        this.configLogger.info('groups.json updated');
    }

    private readJsonArray<T>(filePath: string): T[] {
        if (!fs.existsSync(filePath)) {
            this.configLogger.warn('file not found: %s, returning empty array', filePath);
            return [];
        }
        return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T[];
    }
}

export default new ConfigPersistence();
