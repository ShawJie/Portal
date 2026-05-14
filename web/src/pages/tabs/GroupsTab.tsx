import { useState } from 'react';
import {
    Card,
    Input,
    Button,
    Subtitle2,
    Caption1,
    Body1,
    Badge,
    Field,
    Textarea,
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogContent,
    DialogActions,
    DialogTrigger,
    Dropdown,
    Option,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import { AddRegular, EditRegular, DeleteRegular, ArrowDownloadRegular } from '@fluentui/react-icons';
import type { CustomGroup, ProxyRule } from '../../api';
import { api } from '../../api';

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
    itemMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    itemActions: {
        display: 'flex',
        gap: '4px',
    },
});

const GROUP_TYPES = ['select', 'url-test', 'direct', 'block'];

interface GroupsTabProps {
    groups: CustomGroup[];
    builtinGroups: string[];
    onGroupsChange: (groups: CustomGroup[]) => void;
}

interface EditingGroup {
    groupName: string;
    type: string;
    attachGroup: string;
    proxys: string;
    rules: string;
}

function rulesToText(rules?: ProxyRule[]): string {
    if (!rules || rules.length === 0) return '';
    return rules.map(r => `${r.ruleType},${r.keyword}`).join('\n');
}

function textToRules(text: string): ProxyRule[] {
    if (!text.trim()) return [];
    return text.trim().split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const idx = line.indexOf(',');
            if (idx === -1) return null;
            return { ruleType: line.substring(0, idx), keyword: line.substring(idx + 1) };
        })
        .filter((r): r is ProxyRule => r !== null);
}

export default function GroupsTab({ groups, builtinGroups, onGroupsChange }: GroupsTabProps) {
    const styles = useStyles();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form, setForm] = useState<EditingGroup>({ groupName: '', type: 'select', attachGroup: '', proxys: '', rules: '' });
    const [importUrl, setImportUrl] = useState('');
    const [importing, setImporting] = useState(false);

    const openAdd = () => {
        setEditingIndex(null);
        setForm({ groupName: '', type: 'select', attachGroup: '', proxys: '', rules: '' });
        setDialogOpen(true);
    };

    const openEdit = (index: number) => {
        const group = groups[index];
        setEditingIndex(index);
        setForm({
            groupName: group.groupName,
            type: group.type,
            attachGroup: (group.attachGroup || []).join('\n'),
            proxys: group.proxys || '',
            rules: rulesToText(group.rules),
        });
        setDialogOpen(true);
    };

    const handleImportRules = async () => {
        if (!importUrl.trim()) return;
        setImporting(true);
        try {
            const rules = await api.fetchRules(importUrl.trim());
            const newText = rules.map(r => `${r.ruleType},${r.keyword}`).join('\n');
            setForm(f => {
                const current = f.rules.trim();
                return { ...f, rules: current ? `${current}\n${newText}` : newText };
            });
            setImportUrl('');
        } catch (err) {
            console.error('Failed to import rules:', err);
        } finally {
            setImporting(false);
        }
    };

    const handleSave = () => {
        const group: CustomGroup = {
            groupName: form.groupName,
            type: form.type,
        };

        const attachGroup = form.attachGroup.trim().split('\n').map(s => s.trim()).filter(s => s.length > 0);
        if (attachGroup.length > 0) group.attachGroup = attachGroup;

        if (form.proxys.trim()) group.proxys = form.proxys.trim();

        const rules = textToRules(form.rules);
        if (rules.length > 0) group.rules = rules;

        const updated = [...groups];
        if (editingIndex !== null) {
            updated[editingIndex] = group;
        } else {
            updated.push(group);
        }
        onGroupsChange(updated);
        setDialogOpen(false);
    };

    const handleDelete = (index: number) => {
        const updated = [...groups];
        updated.splice(index, 1);
        onGroupsChange(updated);
    };

    return (
        <>
            <Card className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Subtitle2>Custom Groups</Subtitle2>
                    <Caption1>{groups.length} groups</Caption1>
                </div>
                <div className={styles.list}>
                    {groups.map((group, i) => (
                        <div key={i} className={styles.item}>
                            <div className={styles.itemInfo}>
                                <Body1>{group.groupName}</Body1>
                                <div className={styles.itemMeta}>
                                    <Badge appearance="outline" size="small">{group.type}</Badge>
                                    {group.rules && <Caption1>{group.rules.length} rules</Caption1>}
                                    {group.attachGroup && <Caption1>{group.attachGroup.length} attached</Caption1>}
                                </div>
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
                    Add Group
                </Button>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{editingIndex !== null ? 'Edit' : 'Add'} Group</DialogTitle>
                        <DialogContent>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
                                <Field label="Group Name" required>
                                    <Input
                                        value={form.groupName}
                                        onChange={(_, data) => setForm(f => ({ ...f, groupName: data.value }))}
                                    />
                                </Field>
                                <Field label="Type" required>
                                    <Dropdown
                                        value={form.type}
                                        selectedOptions={[form.type]}
                                        onOptionSelect={(_, data) => setForm(f => ({ ...f, type: data.optionValue || 'select' }))}
                                    >
                                        {GROUP_TYPES.map(t => (
                                            <Option key={t} value={t}>{t}</Option>
                                        ))}
                                    </Dropdown>
                                </Field>
                                <Field label="Attach Groups" hint="One group name per line">
                                    <Textarea
                                        value={form.attachGroup}
                                        onChange={(_, data) => setForm(f => ({ ...f, attachGroup: data.value }))}
                                        resize="vertical"
                                    />
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                        {builtinGroups.map(name => (
                                            <Button
                                                key={name}
                                                size="small"
                                                appearance="outline"
                                                onClick={() => setForm(f => {
                                                    const lines = f.attachGroup.trim();
                                                    const existing = lines.split('\n').map(s => s.trim()).filter(s => s);
                                                    if (existing.includes(name)) return f;
                                                    const updated = lines ? `${lines}\n${name}` : name;
                                                    return { ...f, attachGroup: updated };
                                                })}
                                            >
                                                {name}
                                            </Button>
                                        ))}
                                    </div>
                                </Field>
                                <Field label="Proxy Filter (regex)">
                                    <Input
                                        value={form.proxys}
                                        onChange={(_, data) => setForm(f => ({ ...f, proxys: data.value }))}
                                    />
                                </Field>
                                <Field label="Rules" hint="One rule per line, format: RULE_TYPE,keyword">
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                                        <Input
                                            style={{ flex: 1 }}
                                            placeholder="Import from URL..."
                                            value={importUrl}
                                            onChange={(_, data) => setImportUrl(data.value)}
                                        />
                                        <Button
                                            appearance="outline"
                                            icon={<ArrowDownloadRegular />}
                                            onClick={handleImportRules}
                                            disabled={importing || !importUrl.trim()}
                                        >
                                            {importing ? 'Importing...' : 'Import'}
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={form.rules}
                                        onChange={(_, data) => setForm(f => ({ ...f, rules: data.value }))}
                                        resize="vertical"
                                        style={{ minHeight: '150px', fontFamily: 'monospace' }}
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
                                disabled={!form.groupName}
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
