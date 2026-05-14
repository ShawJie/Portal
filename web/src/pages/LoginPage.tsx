import { useState } from 'react';
import {
    Card,
    Input,
    Button,
    Title1,
    Body1,
    makeStyles,
    tokens,
    MessageBar,
    MessageBarBody,
    Field,
} from '@fluentui/react-components';
import { PersonRegular, LockClosedRegular } from '@fluentui/react-icons';
import { api } from '../api';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: tokens.colorNeutralBackground2,
    },
    card: {
        width: '380px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    header: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
});

interface LoginPageProps {
    onLogin: (username: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const styles = useStyles();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await api.login(username, password);
            onLogin(result.username);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <div className={styles.header}>
                    <Title1>Portal</Title1>
                    <Body1>Configuration Management</Body1>
                </div>

                {error && (
                    <MessageBar intent="error">
                        <MessageBarBody>{error}</MessageBarBody>
                    </MessageBar>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <Field label="Username">
                        <Input
                            contentBefore={<PersonRegular />}
                            value={username}
                            onChange={(_, data) => setUsername(data.value)}
                            required
                        />
                    </Field>
                    <Field label="Password">
                        <Input
                            contentBefore={<LockClosedRegular />}
                            type="password"
                            value={password}
                            onChange={(_, data) => setPassword(data.value)}
                            required
                        />
                    </Field>
                    <Button
                        appearance="primary"
                        type="submit"
                        disabled={loading || !username || !password}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
