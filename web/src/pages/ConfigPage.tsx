import { useEffect, useState, useCallback } from 'react';
import {
    Button,
    Title2,
    Subtitle2,
    makeStyles,
    tokens,
    Spinner,
    Toolbar,
    ToolbarButton,
    Tab,
    TabList,
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
import { SignOutRegular, CheckmarkRegular } from '@fluentui/react-icons';
import { api, type PortalConfig, type ProxyNode, type CustomProxy, type CustomGroup } from '../api';
import GeneralTab from './tabs/GeneralTab';
import CustomProxysTab from './tabs/CustomProxysTab';
import GroupsTab from './tabs/GroupsTab';

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
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
    },
});

interface ConfigPageProps {
    username: string;
    onLogout: () => void;
}

type TabValue = 'general' | 'custom-proxys' | 'groups';

export default function ConfigPage({ username, onLogout }: ConfigPageProps) {
    const styles = useStyles();
    const [activeTab, setActiveTab] = useState<TabValue>('general');
    const [config, setConfig] = useState<PortalConfig | null>(null);
    const [proxies, setProxies] = useState<ProxyNode[]>([]);
    const [customProxys, setCustomProxys] = useState<CustomProxy[]>([]);
    const [groups, setGroups] = useState<CustomGroup[]>([]);
    const [builtinGroups, setBuiltinGroups] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [saveResult, setSaveResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [configData, proxiesData, customProxysData, groupsData, builtinGroupsData] = await Promise.all([
                api.getConfig(),
                api.getProxies(),
                api.getCustomProxys(),
                api.getGroups(),
                api.getBuiltinGroups(),
            ]);
            setConfig(configData);
            setProxies(proxiesData);
            setCustomProxys(customProxysData);
            setGroups(groupsData);
            setBuiltinGroups(builtinGroupsData);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleApply = async () => {
        if (!config) return;
        setSaving(true);
        setSaveResult(null);
        setConfirmOpen(false);
        try {
            const results: string[] = [];

            const configResult = await api.saveConfig(config);
            results.push(configResult.refreshed ? 'Config saved, proxies refreshed' : 'Config saved');

            await api.saveCustomProxys(customProxys);
            results.push('Custom proxys saved');

            await api.saveGroups(groups);
            results.push('Groups saved');

            setSaveResult({ type: 'success', message: results.join('. ') + '.' });
            await loadData();
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
                <TabList
                    selectedValue={activeTab}
                    onTabSelect={(_, data) => setActiveTab(data.value as TabValue)}
                >
                    <Tab value="general">General</Tab>
                    <Tab value="custom-proxys">Custom Proxys</Tab>
                    <Tab value="groups">Groups</Tab>
                </TabList>

                {activeTab === 'general' && (
                    <GeneralTab
                        config={config}
                        proxies={proxies}
                        onConfigChange={setConfig}
                        onProxiesChange={setProxies}
                    />
                )}

                {activeTab === 'custom-proxys' && (
                    <CustomProxysTab
                        proxys={customProxys}
                        onProxysChange={setCustomProxys}
                    />
                )}

                {activeTab === 'groups' && (
                    <GroupsTab
                        groups={groups}
                        builtinGroups={builtinGroups}
                        onGroupsChange={setGroups}
                    />
                )}

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
                                Are you sure you want to save all changes? Config, custom proxys, and groups will be updated.
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
