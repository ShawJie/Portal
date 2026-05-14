import {
    Card,
    Input,
    Button,
    Subtitle2,
    Caption1,
    Body1,
    Badge,
    Switch,
    Field,
    Textarea,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import { DismissCircleRegular } from '@fluentui/react-icons';
import type { PortalConfig, ProxyNode } from '../../api';

const useStyles = makeStyles({
    card: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    sourceItem: {
        display: 'flex',
        gap: '12px',
        alignItems: 'end',
    },
    proxyItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    proxyInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    proxyMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    proxyList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '400px',
        overflowY: 'auto',
    },
});

interface GeneralTabProps {
    config: PortalConfig;
    proxies: ProxyNode[];
    onConfigChange: (config: PortalConfig) => void;
    onProxiesChange: (proxies: ProxyNode[]) => void;
}

export default function GeneralTab({ config, proxies, onConfigChange, onProxiesChange }: GeneralTabProps) {
    const styles = useStyles();

    const updateField = <K extends keyof PortalConfig>(key: K, value: PortalConfig[K]) => {
        onConfigChange({ ...config, [key]: value });
    };

    const updateSourcePath = (index: number, field: 'name' | 'url', value: string) => {
        const paths = [...(config.sourcePaths || [])];
        paths[index] = { ...paths[index], [field]: value };
        onConfigChange({ ...config, sourcePaths: paths });
    };

    const addSourcePath = () => {
        onConfigChange({ ...config, sourcePaths: [...(config.sourcePaths || []), { name: '', url: '' }] });
    };

    const removeSourcePath = (index: number) => {
        const paths = [...(config.sourcePaths || [])];
        paths.splice(index, 1);
        onConfigChange({ ...config, sourcePaths: paths });
    };

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const excludeProxy = (nodeName: string) => {
        const escaped = escapeRegex(nodeName);
        const current = config.exclude || '';
        const updated = current ? `${current}|${escaped}` : escaped;
        onConfigChange({ ...config, exclude: updated });
        onProxiesChange(proxies.filter(p => p.name !== nodeName));
    };

    return (
        <>
            <Card className={styles.card}>
                <Subtitle2>General</Subtitle2>
                <Field label="Host">
                    <Input
                        value={config.host || ''}
                        onChange={(_, data) => updateField('host', data.value)}
                    />
                </Field>
                <Field label="Log Level">
                    <Input
                        value={config.logLevel || 'info'}
                        onChange={(_, data) => updateField('logLevel', data.value)}
                    />
                </Field>
                <Field label="Refresh Cron">
                    <Input
                        value={config.refreshCron || ''}
                        onChange={(_, data) => updateField('refreshCron', data.value)}
                    />
                </Field>
                <Field label="Access Control">
                    <Switch
                        checked={config.accessControl || false}
                        onChange={(_, data) => updateField('accessControl', data.checked)}
                    />
                </Field>
            </Card>

            <Card className={styles.card}>
                <Subtitle2>Source Paths</Subtitle2>
                {(config.sourcePaths || []).map((sp, i) => (
                    <div key={i} className={styles.sourceItem}>
                        <Field label="Name" style={{ flex: 1 }}>
                            <Input
                                value={sp.name}
                                onChange={(_, data) => updateSourcePath(i, 'name', data.value)}
                            />
                        </Field>
                        <Field label="URL" style={{ flex: 2 }}>
                            <Input
                                value={sp.url}
                                onChange={(_, data) => updateSourcePath(i, 'url', data.value)}
                            />
                        </Field>
                        <Button
                            appearance="subtle"
                            onClick={() => removeSourcePath(i)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
                <Button appearance="outline" onClick={addSourcePath}>
                    Add Source
                </Button>
            </Card>

            <Card className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Subtitle2>Proxy Nodes</Subtitle2>
                    <Caption1>{proxies.length} nodes</Caption1>
                </div>
                <div className={styles.proxyList}>
                    {proxies.map((proxy) => (
                        <div key={proxy.name} className={styles.proxyItem}>
                            <div className={styles.proxyInfo}>
                                <Body1>{proxy.name}</Body1>
                                <div className={styles.proxyMeta}>
                                    <Badge appearance="outline" size="small">{proxy.type}</Badge>
                                    <Caption1>{proxy.server}:{proxy.port}</Caption1>
                                </div>
                            </div>
                            <Button
                                appearance="subtle"
                                icon={<DismissCircleRegular />}
                                size="small"
                                onClick={() => excludeProxy(proxy.name)}
                            />
                        </div>
                    ))}
                </div>
            </Card>

            <Card className={styles.card}>
                <Subtitle2>Proxy Filter</Subtitle2>
                <Field label="Include (regex)">
                    <Textarea
                        value={config.include || ''}
                        onChange={(_, data) => updateField('include', data.value || undefined)}
                        resize="vertical"
                    />
                </Field>
                <Field label="Exclude (regex)">
                    <Textarea
                        value={config.exclude || ''}
                        onChange={(_, data) => updateField('exclude', data.value || undefined)}
                        resize="vertical"
                    />
                </Field>
            </Card>
        </>
    );
}
