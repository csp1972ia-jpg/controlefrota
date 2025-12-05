import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/Reservations.css';

export function Reservations() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [returnTime, setReturnTime] = useState('');

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const { data, error } = await supabase
                .from('vehicle_usage')
                .select('*')
                .in('status', ['Reservado', 'Em Uso'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReservations(data || []);
        } catch (error) {
            console.error('Error fetching reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePickup = (reservation: any) => {
        setSelectedReservation(reservation);
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().slice(0, 5);
        setPickupDate(today);
        setPickupTime(now);
        setShowPickupModal(true);
    };

    const handleReturn = (reservation: any) => {
        setSelectedReservation(reservation);
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().slice(0, 5);
        setReturnDate(today);
        setReturnTime(now);
        setShowReturnModal(true);
    };

    const confirmPickup = async () => {
        if (!selectedReservation || !pickupDate || !pickupTime) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('vehicle_usage')
                .update({
                    status: 'Em Uso',
                    data_saida: pickupDate,
                    hora_saida: pickupTime,
                } as any)
                .eq('id', selectedReservation.id);

            if (error) throw error;

            alert('Retirada registrada com sucesso!');
            setShowPickupModal(false);
            setSelectedReservation(null);
            fetchReservations();
        } catch (error) {
            console.error('Error updating pickup:', error);
            alert('Erro ao registrar retirada');
        } finally {
            setLoading(false);
        }
    };

    const confirmReturn = async () => {
        if (!selectedReservation || !returnDate || !returnTime) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('vehicle_usage')
                .update({
                    status: 'Finalizado',
                    data_retorno: returnDate,
                    hora_retorno: returnTime,
                } as any)
                .eq('id', selectedReservation.id);

            if (error) throw error;

            alert('Devolução registrada com sucesso! Veículo agora está disponível.');
            setShowReturnModal(false);
            setSelectedReservation(null);
            fetchReservations();
        } catch (error) {
            console.error('Error updating return:', error);
            alert('Erro ao registrar devolução');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            'Reservado': 'badge-warning',
            'Em Uso': 'badge-danger',
        };
        return badges[status as keyof typeof badges] || 'badge-info';
    };

    if (loading && reservations.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando reservas...</p>
            </div>
        );
    }

    return (
        <div className="reservations-page">
            <div className="page-header">
                <div>
                    <h1>Gerenciamento de Reservas</h1>
                    <p className="text-muted">Registre retiradas e devoluções de veículos</p>
                </div>
            </div>

            {reservations.length === 0 ? (
                <div className="empty-state">
                    <p>📋 Nenhuma reserva ativa no momento</p>
                </div>
            ) : (
                <div className="reservations-grid">
                    {reservations.map((reservation) => (
                        <div key={reservation.id} className="reservation-card">
                            <div className="reservation-header">
                                <h3>{reservation.veiculo}</h3>
                                <span className={`badge ${getStatusBadge(reservation.status)}`}>
                                    {reservation.status}
                                </span>
                            </div>

                            <div className="reservation-details">
                                <div className="detail-row">
                                    <span className="label">Condutor:</span>
                                    <span className="value">{reservation.condutor}</span>
                                </div>

                                {reservation.data_reserva && (
                                    <div className="detail-row">
                                        <span className="label">Data Reserva:</span>
                                        <span className="value">
                                            {new Date(reservation.data_reserva).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                )}

                                {reservation.data_saida && (
                                    <div className="detail-row">
                                        <span className="label">Data Saída:</span>
                                        <span className="value">
                                            {new Date(reservation.data_saida).toLocaleDateString('pt-BR')} {reservation.hora_saida}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="reservation-actions">
                                {reservation.status === 'Reservado' && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handlePickup(reservation)}
                                    >
                                        🚗 Registrar Retirada
                                    </button>
                                )}

                                {reservation.status === 'Em Uso' && (
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleReturn(reservation)}
                                    >
                                        ✅ Registrar Devolução
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Retirada */}
            {showPickupModal && selectedReservation && (
                <div className="modal-overlay" onClick={() => setShowPickupModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Registrar Retirada</h2>
                            <button className="modal-close" onClick={() => setShowPickupModal(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <p><strong>Veículo:</strong> {selectedReservation.veiculo}</p>
                            <p><strong>Condutor:</strong> {selectedReservation.condutor}</p>

                            <div className="form-group">
                                <label htmlFor="pickup_date">Data da Retirada *</label>
                                <input
                                    id="pickup_date"
                                    type="date"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="pickup_time">Hora da Retirada *</label>
                                <input
                                    id="pickup_time"
                                    type="time"
                                    value={pickupTime}
                                    onChange={(e) => setPickupTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowPickupModal(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={confirmPickup} disabled={loading}>
                                {loading ? 'Registrando...' : 'Confirmar Retirada'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Devolução */}
            {showReturnModal && selectedReservation && (
                <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Registrar Devolução</h2>
                            <button className="modal-close" onClick={() => setShowReturnModal(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <p><strong>Veículo:</strong> {selectedReservation.veiculo}</p>
                            <p><strong>Condutor:</strong> {selectedReservation.condutor}</p>
                            <p><strong>Retirada:</strong> {new Date(selectedReservation.data_saida).toLocaleDateString('pt-BR')} {selectedReservation.hora_saida}</p>

                            <div className="form-group">
                                <label htmlFor="return_date">Data da Devolução *</label>
                                <input
                                    id="return_date"
                                    type="date"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="return_time">Hora da Devolução *</label>
                                <input
                                    id="return_time"
                                    type="time"
                                    value={returnTime}
                                    onChange={(e) => setReturnTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-success" onClick={confirmReturn} disabled={loading}>
                                {loading ? 'Registrando...' : 'Confirmar Devolução'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
