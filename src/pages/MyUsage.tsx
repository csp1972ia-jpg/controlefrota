import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import '../styles/MyUsage.css';

export function MyUsage() {
    const { user } = useAuth();
    const [usageHistory, setUsageHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUsageHistory();
        }
    }, [user]);

    const fetchUsageHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('vehicle_usage')
                .select('*')
                .eq('user_id', user?.id)
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
        <div className="my-usage-page">
            <div className="page-header">
                <h1>Minhas Retiradas</h1>
                <p className="text-muted">Histórico de uso de veículos</p>
            </div>

            {usageHistory.length === 0 ? (
                <div className="empty-state">
                    <p>📋 Você ainda não tem histórico de uso</p>
                </div>
            ) : (
                <div className="usage-list">
                    {usageHistory.map((usage) => (
                        <div key={usage.id} className="usage-card">
                            <div className="usage-header">
                                <h3>{usage.veiculo}</h3>
                                <span className={`badge ${getStatusBadge(usage.status)}`}>
                                    {usage.status}
                                </span>
                            </div>
                            <div className="usage-details">
                                {usage.data_reserva && (
                                    <p><strong>Reserva:</strong> {new Date(usage.data_reserva).toLocaleDateString('pt-BR')}</p>
                                )}
                                {usage.data_saida && (
                                    <p><strong>Saída:</strong> {new Date(usage.data_saida).toLocaleDateString('pt-BR')} às {usage.hora_saida}</p>
                                )}
                                {usage.data_retorno && (
                                    <p><strong>Retorno:</strong> {new Date(usage.data_retorno).toLocaleDateString('pt-BR')} às {usage.hora_retorno}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
