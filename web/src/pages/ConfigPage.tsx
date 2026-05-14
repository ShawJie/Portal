import { useEffect, useState, useCallback } from 'react';
import {
    Card,
    Input,
    Button,
    Title2,
    Subtitle2,
    Body1,
    Caption1,
    Badge,
    Switch,
    makeStyles,
    tokens,
    Spinner,
    Toolbar,
    ToolbarButton,
    Field,
    Textarea,
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogContent,
    DialogActions,
    DialogTrigger,
    MessageBar,
    MessageBarBody,
} from '@fluentui/react-components';
import { SignOutRegular, DismissCircleRegular, CheckmarkRegular } from '@fluentui/react-icons';
import { api, type PortalConfig, type ProxyNode } from '../api';

const useStyles = makeStyles({
    page: {
        minHeight: '100vh',
        backgroundColor: tokens.colorNeutralBackground2,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: tokens.colorNeutralBackground1,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    content: {
        maxWidth: '800px',
        margin: '24px auto',
        padding: '0 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
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
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
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

interface ConfigPageProps {
    username: string;
    onLogout: () => void;
}

export default function ConfigPage({ username, onLogout }: ConfigPageProps) {
    const styles = useStyles();
    const [config, setConfig] = useState<PortalConfig | null>(null);
    const [proxies, setProxies] = useState<ProxyNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [saveResult, setSaveResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const loadConfig = useCallback(async () => {
        setLoading(true);
        try {
            const [configData, proxiesData] = await Promise.all([
                api.getConfig(),
                api.getProxies(),
            ]);
            setConfig(configData);
            setProxies(proxiesData);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const handleApply = async () => {
        if (!config) return;
        setSaving(true);
        setSaveResult(null);
        setConfirmOpen(false);
        try {
            const result = await api.saveConfig(config);
            setSaveResult({ type: 'success', message: result.refreshed ? 'Config saved, proxies refreshed.' : 'Config saved.' });
            await loadConfig();
        } catch (err) {
            setSaveResult({ type: 'error', message: err instanceof Error ? err.message : 'Save failed' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.logout();
        } catch { /* ignore */ }
        onLogout();
    };

    const updateField = <K extends keyof PortalConfig>(key: K, value: PortalConfig[K]) => {
        setConfig(prev => prev ? { ...prev, [key]: value } : prev);
    };

    const updateSourcePath = (index: number, field: 'name' | 'url', value: string) => {
        setConfig(prev => {
            if (!prev) return prev;
            const paths = [...(prev.sourcePaths || [])];
            paths[index] = { ...paths[index], [field]: value };
            return { ...prev, sourcePaths: paths };
        });
    };

    const addSourcePath = () => {
        setConfig(prev => {
            if (!prev) return prev;
            return { ...prev, sourcePaths: [...(prev.sourcePaths || []), { name: '', url: '' }] };
        });
    };

    const removeSourcePath = (index: number) => {
        setConfig(prev => {
            if (!prev) return prev;
            const paths = [...(prev.sourcePaths || [])];
            paths.splice(index, 1);
            return { ...prev, sourcePaths: paths };
        });
    };

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const excludeProxy = (nodeName: string) => {
        setConfig(prev => {
            if (!prev) return prev;
            const escaped = escapeRegex(nodeName);
            const current = prev.exclude || '';
            const updated = current ? `${current}|${escaped}` : escaped;
            return { ...prev, exclude: updated };
        });
        setProxies(prev => prev.filter(p => p.name !== nodeName));
    };

    if (loading || !config) {
        return (
            <div className={styles.loading}>
                <Spinner size="large" label="Loading configuration..." />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Title2>Portal</Title2>
                    <Subtitle2>Configuration</Subtitle2>
                </div>
                <Toolbar>
                    <Subtitle2>{username}</Subtitle2>
                    <ToolbarButton
                        icon={<SignOutRegular />}
                        onClick={handleLogout}
                    >
                        Sign out
                    </ToolbarButton>
                </Toolbar>
            </div>

            <div className={styles.content}>
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

                {saveResult && (
                    <MessageBar intent={saveResult.type === 'success' ? 'success' : 'error'}>
                        <MessageBarBody>{saveResult.message}</MessageBarBody>
                    </MessageBar>
                )}

                <Dialog open={confirmOpen} onOpenChange={(_, data) => setConfirmOpen(data.open)}>
                    <DialogSurface>
                        <DialogBody>
                            <DialogTitle>Apply Changes</DialogTitle>
                            <DialogContent>
                                Are you sure you want to save the configuration? If proxy filter or source paths changed, proxies will be refreshed.
                            </DialogContent>
                            <DialogActions>
                                <DialogTrigger disableButtonEnhancement>
                                    <Button appearance="secondary">Cancel</Button>
                                </DialogTrigger>
                                <Button appearance="primary" onClick={handleApply}>Confirm</Button>
                            </DialogActions>
                        </DialogBody>
                    </DialogSurface>
                </Dialog>

                <Button
                    appearance="primary"
                    icon={<CheckmarkRegular />}
                    size="large"
                    onClick={() => setConfirmOpen(true)}
                    disabled={saving}
                >
                    {saving ? 'Applying...' : 'Apply Changes'}
                </Button>
            </div>
        </div>
    );
}
