import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import '../styles/MyInfractions.css';

export function MyInfractions() {
    const { user } = useAuth();
    const [infractions, setInfractions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchInfractions();
        }
    }, [user]);

    const fetchInfractions = async () => {
        try {
            const { data, error } = await supabase
                .from('infractions')
                .select('*')
                .eq('condutor_infrator_id', user?.id)
                .order('data_infracao', { ascending: false });

            if (error) throw error;
            setInfractions(data || []);
        } catch (error) {
            console.error('Error fetching infractions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando infrações...</p>
            </div>
        );
    }

    return (
        <div className="my-infractions-page">
            <div className="page-header">
                <h1>Minhas Infrações</h1>
                <p className="text-muted">Infrações identificadas automaticamente</p>
            </div>

            {infractions.length === 0 ? (
                <div className="empty-state">
                    <p>✅ Você não possui infrações registradas</p>
                </div>
            ) : (
                <div className="infractions-list">
                    {infractions.map((infraction) => (
                        <div key={infraction.id} className="infraction-card">
                            <div className="infraction-header">
                                <h3>{infraction.veiculo}</h3>
                                <span className="badge badge-danger">
                                    {infraction.auto_infracao}
                                </span>
                            </div>
                            <div className="infraction-details">
                                <p><strong>Data:</strong> {new Date(infraction.data_infracao).toLocaleDateString('pt-BR')}</p>
                                {infraction.horario && <p><strong>Horário:</strong> {infraction.horario}</p>}
                                {infraction.local && <p><strong>Local:</strong> {infraction.local}</p>}
                                {infraction.infracao && <p><strong>Infração:</strong> {infraction.infracao}</p>}
                                {infraction.valor_original && (
                                    <p><strong>Valor:</strong> R$ {Number(infraction.valor_original).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                )}
                                {infraction.vencimento && (
                                    <p><strong>Vencimento:</strong> {new Date(infraction.vencimento).toLocaleDateString('pt-BR')}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
