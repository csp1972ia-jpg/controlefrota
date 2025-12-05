import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/Users.css';

export function Users() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nome_condutor: '',
        email: '',
        password: '',
        permissoes: 'USER' as 'ADMIN' | 'USER',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('users')
                .insert([{
                    nome_condutor: formData.nome_condutor,
                    email: formData.email,
                    password_hash: formData.password,
                    permissoes: formData.permissoes,
                    tipo: formData.permissoes === 'ADMIN' ? 1 : 2,
                } as any]);

            if (error) throw error;

            alert('Usuário criado com sucesso!');
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Erro ao criar usuário');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ ativo: !currentStatus })
                .eq('id', userId);

            if (error) throw error;
            fetchUsers();
        } catch (error) {
            console.error('Error toggling user status:', error);
            alert('Erro ao alterar status do usuário');
        }
    };

    const toggleUserRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        const newTipo = newRole === 'ADMIN' ? 1 : 2;

        if (!confirm(`Tem certeza que deseja alterar a permissão de ${currentRole} para ${newRole}?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    permissoes: newRole,
                    tipo: newTipo
                } as any)
                .eq('id', userId);

            if (error) throw error;
            fetchUsers();
        } catch (error) {
            console.error('Error toggling user role:', error);
            alert('Erro ao alterar permissão do usuário');
        }
    };

    const resetForm = () => {
        setFormData({
            nome_condutor: '',
            email: '',
            password: '',
            permissoes: 'USER',
        });
    };

    if (loading && users.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando usuários...</p>
            </div>
        );
    }

    return (
        <div className="users-page">
            <div className="page-header">
                <div>
                    <h1>Gerenciamento de Usuários</h1>
                    <p className="text-muted">Crie e gerencie condutores do sistema</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ➕ Novo Usuário
                </button>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Permissão</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="font-bold">{user.nome_condutor}</td>
                                <td>{user.email}</td>
                                <td>
                                    <button
                                        className={`badge ${user.permissoes === 'ADMIN' ? 'badge-success' : 'badge-info'}`}
                                        style={{ border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                                        onClick={() => toggleUserRole(user.id, user.permissoes)}
                                        title="Clique para alterar a permissão"
                                    >
                                        {user.permissoes} {user.permissoes === 'ADMIN' ? '👑' : '👤'}
                                    </button>
                                </td>
                                <td>
                                    <span className={`badge ${user.ativo ? 'badge-success' : 'badge-danger'}`}>
                                        {user.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className={`btn-small ${user.ativo ? 'btn-danger' : 'btn-success'}`}
                                        onClick={() => toggleUserStatus(user.id, user.ativo)}
                                    >
                                        {user.ativo ? '🔒 Bloquear' : '✅ Ativar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Novo Usuário</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="user-form">
                            <div className="form-group">
                                <label htmlFor="nome_condutor">Nome Completo *</label>
                                <input
                                    id="nome_condutor"
                                    type="text"
                                    value={formData.nome_condutor}
                                    onChange={(e) => setFormData({ ...formData, nome_condutor: e.target.value })}
                                    placeholder="Nome do condutor"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Senha *</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Senha do usuário"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="permissoes">Permissão *</label>
                                <select
                                    id="permissoes"
                                    value={formData.permissoes}
                                    onChange={(e) => setFormData({ ...formData, permissoes: e.target.value as any })}
                                    required
                                >
                                    <option value="USER">USER - Usuário Normal</option>
                                    <option value="ADMIN">ADMIN - Administrador</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Criando...' : 'Criar Usuário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
