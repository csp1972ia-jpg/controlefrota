import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nomeCondutor, setNomeCondutor] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isSignUp) {
                result = await signUp(email, password, nomeCondutor);
            } else {
                result = await signIn(email, password);
            }

            if (result.error) {
                setError(result.error.message);
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Erro ao processar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>🚗 Controle de Frota</h1>
                    <p>Sistema de Gerenciamento de Veículos</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {isSignUp && (
                        <div className="form-group">
                            <label htmlFor="nome">Nome Completo</label>
                            <input
                                id="nome"
                                type="text"
                                value={nomeCondutor}
                                onChange={(e) => setNomeCondutor(e.target.value)}
                                placeholder="Seu nome completo"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
                    </button>

                    <div className="login-footer">
                        <button
                            type="button"
                            className="toggle-mode"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}
                        >
                            {isSignUp ? 'Já tem conta? Entrar' : 'Criar nova conta'}
                        </button>
                        {isSignUp && (
                            <p className="info-text">
                                ℹ️ O primeiro usuário será automaticamente ADMIN
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
