import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Layout.css';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const adminMenuItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/vehicles', label: 'Veículos', icon: '🚗' },
        { path: '/reservations', label: 'Reservas', icon: '📅' },
        { path: '/infractions', label: 'Infrações', icon: '⚠️' },
        { path: '/users', label: 'Usuários', icon: '👥' },
        { path: '/usage-history', label: 'Histórico', icon: '📋' },
    ];

    const userMenuItems = [
        { path: '/fleet', label: 'Frota', icon: '🚗' },
        { path: '/my-usage', label: 'Minhas Retiradas', icon: '📋' },
        { path: '/my-infractions', label: 'Minhas Infrações', icon: '⚠️' },
    ];

    const menuItems = user?.permissoes === 'ADMIN' ? adminMenuItems : userMenuItems;

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>🚗 Controle de Frota</h2>
                    <div className="user-info">
                        <div className="user-avatar">{user?.nome_condutor.charAt(0).toUpperCase()}</div>
                        <div className="user-details">
                            <p className="user-name">{user?.nome_condutor}</p>
                            <span className={`user-role badge badge-${user?.permissoes === 'ADMIN' ? 'success' : 'info'}`}>
                                {user?.permissoes}
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleSignOut} className="btn-logout">
                        <span>🚪</span>
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <div className="content-wrapper">
                    {children}
                </div>
            </main>
        </div>
    );
}
