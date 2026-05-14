import { useState } from 'react';
import {
    Card,
    Input,
    Button,
    Subtitle2,
    Caption1,
    Body1,
    Field,
    Textarea,
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogContent,
    DialogActions,
    DialogTrigger,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import { AddRegular, EditRegular, DeleteRegular } from '@fluentui/react-icons';
import type { CustomProxy } from '../../api';

const useStyles = makeStyles({
    card: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '500px',
        overflowY: 'auto',
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    itemInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    itemActions: {
        display: 'flex',
        gap: '4px',
    },
});

interface CustomProxysTabProps {
    proxys: CustomProxy[];
    onProxysChange: (proxys: CustomProxy[]) => void;
}

interface EditingProxy {
    name: string;
    server: string;
    extra: string;
}

export default function CustomProxysTab({ proxys, onProxysChange }: CustomProxysTabProps) {
    const styles = useStyles();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form, setForm] = useState<EditingProxy>({ name: '', server: '', extra: '' });

    const openAdd = () => {
        setEditingIndex(null);
        setForm({ name: '', server: '', extra: '' });
        setDialogOpen(true);
    };

    const openEdit = (index: number) => {
        const proxy = proxys[index];
        const { name, server, ...rest } = proxy;
        const extra = Object.keys(rest).length > 0 ? JSON.stringify(rest, null, 2) : '';
        setEditingIndex(index);
        setForm({ name, server, extra });
        setDialogOpen(true);
    };

    const handleSave = () => {
        let extraObj: Record<string, unknown> = {};
        if (form.extra.trim()) {
            try {
                extraObj = JSON.parse(form.extra);
            } catch {
                return;
            }
        }

        const proxy: CustomProxy = { name: form.name, server: form.server, ...extraObj };
        const updated = [...proxys];
        if (editingIndex !== null) {
            updated[editingIndex] = proxy;
        } else {
            updated.push(proxy);
        }
        onProxysChange(updated);
        setDialogOpen(false);
    };

    const handleDelete = (index: number) => {
        const updated = [...proxys];
        updated.splice(index, 1);
        onProxysChange(updated);
    };

    return (
        <>
            <Card className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Subtitle2>Custom Proxy Nodes</Subtitle2>
                    <Caption1>{proxys.length} nodes</Caption1>
                </div>
                <div className={styles.list}>
                    {proxys.map((proxy, i) => (
                        <div key={i} className={styles.item}>
                            <div className={styles.itemInfo}>
                                <Body1>{proxy.name}</Body1>
                                <Caption1>{proxy.server}:{proxy.port as number || '-'}</Caption1>
                            </div>
                            <div className={styles.itemActions}>
                                <Button
                                    appearance="subtle"
                                    icon={<EditRegular />}
                                    size="small"
                                    onClick={() => openEdit(i)}
                                />
                                <Button
                                    appearance="subtle"
                                    icon={<DeleteRegular />}
                                    size="small"
                                    onClick={() => handleDelete(i)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <Button appearance="outline" icon={<AddRegular />} onClick={openAdd}>
                    Add Proxy
                </Button>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{editingIndex !== null ? 'Edit' : 'Add'} Custom Proxy</DialogTitle>
                        <DialogContent>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
                                <Field label="Name" required>
                                    <Input
                                        value={form.name}
                                        onChange={(_, data) => setForm(f => ({ ...f, name: data.value }))}
                                    />
                                </Field>
                                <Field label="Server" required>
                                    <Input
                                        value={form.server}
                                        onChange={(_, data) => setForm(f => ({ ...f, server: data.value }))}
                                    />
                                </Field>
                                <Field label="Extra Parameters (JSON)" hint="e.g. {&quot;port&quot;: 8621, &quot;type&quot;: &quot;http&quot;, &quot;tls&quot;: true}">
                                    <Textarea
                                        value={form.extra}
                                        onChange={(_, data) => setForm(f => ({ ...f, extra: data.value }))}
                                        resize="vertical"
                                        style={{ minHeight: '100px', fontFamily: 'monospace' }}
                                    />
                                </Field>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <DialogTrigger disableButtonEnhancement>
                                <Button appearance="secondary">Cancel</Button>
                            </DialogTrigger>
                            <Button
                                appearance="primary"
                                onClick={handleSave}
                                disabled={!form.name || !form.server}
                            >
                                Save
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </>
    );
}
