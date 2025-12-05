import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/UsageHistory.css';

export function UsageHistory() {
    const [usageHistory, setUsageHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsage, setSelectedUsage] = useState<any | null>(null);

    useEffect(() => {
        fetchUsageHistory();
    }, []);

    const fetchUsageHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('vehicle_usage')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsageHistory(data || []);
        } catch (error) {
            console.error('Error fetching usage history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            'Reservado': 'badge-warning',
            'Em Uso': 'badge-danger',
            'Finalizado': 'badge-success',
        };
        return badges[status as keyof typeof badges] || 'badge-info';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando histórico...</p>
            </div>
        );
    }

    return (
        <div className="usage-history-page">
            <div className="page-header">
                <h1>Histórico de Uso de Veículos</h1>
                <p className="text-muted">Visualize todo o histórico de retiradas e devoluções</p>
            </div>

            {usageHistory.length === 0 ? (
                <div className="empty-state">
                    <p>📋 Nenhum histórico de uso registrado</p>
                </div>
            ) : (
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Veículo</th>
                                <th>Condutor</th>
                                <th>Status</th>
                                <th>Data Reserva</th>
                                <th>Data Saída</th>
                                <th>Data Retorno</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usageHistory.map((usage) => (
                                <tr key={usage.id} className="clickable-row">
                                    <td className="font-bold">{usage.veiculo}</td>
                                    <td>{usage.condutor}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(usage.status)}`}>
                                            {usage.status}
                                        </span>
                                    </td>
                                    <td>
                                        {usage.data_reserva
                                            ? new Date(usage.data_reserva).toLocaleDateString('pt-BR')
                                            : '-'}
                                    </td>
                                    <td>
                                        {usage.data_saida
                                            ? `${new Date(usage.data_saida).toLocaleDateString('pt-BR')} ${usage.hora_saida || ''}`
                                            : '-'}
                                    </td>
                                    <td>
                                        {usage.data_retorno
                                            ? `${new Date(usage.data_retorno).toLocaleDateString('pt-BR')} ${usage.hora_retorno || ''}`
                                            : '-'}
                                    </td>
                                    <td>
                                        <button
                                            className="btn-small btn-primary"
                                            onClick={() => setSelectedUsage(usage)}
                                        >
                                            👁️ Ver Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedUsage && (
                <div className="modal-overlay" onClick={() => setSelectedUsage(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detalhes do Uso</h2>
                            <button className="modal-close" onClick={() => setSelectedUsage(null)}>✕</button>
                        </div>

                        <div className="details-content">
                            <div className="detail-section">
                                <h3>Informações do Veículo</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Veículo:</strong>
                                        <span>{selectedUsage.veiculo}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Status:</strong>
                                        <span className={`badge ${getStatusBadge(selectedUsage.status)}`}>
                                            {selectedUsage.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Informações do Condutor</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Condutor:</strong>
                                        <span>{selectedUsage.condutor}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Datas e Horários</h3>
                                <div className="detail-grid">
                                    {selectedUsage.data_reserva && (
                                        <div className="detail-item">
                                            <strong>Data Reserva:</strong>
                                            <span>{new Date(selectedUsage.data_reserva).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    )}
                                    {selectedUsage.data_saida && (
                                        <>
                                            <div className="detail-item">
                                                <strong>Data Saída:</strong>
                                                <span>{new Date(selectedUsage.data_saida).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                            <div className="detail-item">
                                                <strong>Hora Saída:</strong>
                                                <span>{selectedUsage.hora_saida || '-'}</span>
                                            </div>
                                        </>
                                    )}
                                    {selectedUsage.data_retorno && (
                                        <>
                                            <div className="detail-item">
                                                <strong>Data Retorno:</strong>
                                                <span>{new Date(selectedUsage.data_retorno).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                            <div className="detail-item">
                                                <strong>Hora Retorno:</strong>
                                                <span>{selectedUsage.hora_retorno || '-'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Informações do Sistema</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Criado em:</strong>
                                        <span>{new Date(selectedUsage.created_at).toLocaleString('pt-BR')}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Atualizado em:</strong>
                                        <span>{new Date(selectedUsage.updated_at).toLocaleString('pt-BR')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setSelectedUsage(null)}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
