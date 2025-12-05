import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { getLocalDate, getLocalTime } from '../utils/dateUtils';
import '../styles/Fleet.css';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

interface VehicleWithUsage extends Vehicle {
    current_user_id?: string;
    current_user_name?: string;
}

export function Fleet() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<VehicleWithUsage[]>([]);
    const [filter, setFilter] = useState<'all' | 'Disponível' | 'Em Uso' | 'Reservado'>('all');
    const [loading, setLoading] = useState(true);
    const [userHasActiveVehicle, setUserHasActiveVehicle] = useState(false);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const { data: vehiclesData, error: vehiclesError } = await supabase
                .from('vehicles')
                .select('*')
                .order('veiculo');

            if (vehiclesError) throw vehiclesError;

            const { data: usageData, error: usageError } = await supabase
                .from('vehicle_usage')
                .select('vehicle_id, user_id, condutor, status')
                .in('status', ['Reservado', 'Em Uso']);

            if (usageError) throw usageError;

            // Verificar se o usuário atual tem algum veículo ativo
            const userActiveVehicle = usageData?.find(u => u.user_id === user?.id);
            setUserHasActiveVehicle(!!userActiveVehicle);

            const vehiclesWithUsage = (vehiclesData || []).map(vehicle => {
                const usage = usageData?.find(u => u.vehicle_id === vehicle.id);
                return {
                    ...vehicle,
                    current_user_id: usage?.user_id,
                    current_user_name: usage?.condutor,
                };
            });

            setVehicles(vehiclesWithUsage);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReserve = async (vehicleId: string, vehicleName: string) => {
        if (!user) return;

        // Verificar se o usuário já tem um veículo ativo
        if (userHasActiveVehicle) {
            alert('Você já possui um veículo reservado ou em uso. Devolva-o antes de reservar outro.');
            return;
        }

        try {
            const { error } = await supabase
                .from('vehicle_usage')
                .insert({
                    vehicle_id: vehicleId,
                    user_id: user.id,
                    condutor: user.nome_condutor,
                    veiculo: vehicleName,
                    status: 'Reservado',
                    data_reserva: getLocalDate(),
                } as any);

            if (error) throw error;
            alert('Veículo reservado com sucesso!');
            fetchVehicles();
        } catch (error) {
            console.error('Error reserving vehicle:', error);
            alert('Erro ao reservar veículo');
        }
    };

    const handlePickup = async (vehicleId: string) => {
        if (!user) return;

        try {
            const { data: usage } = await supabase
                .from('vehicle_usage')
                .select('*')
                .eq('vehicle_id', vehicleId)
                .eq('user_id', user.id)
                .eq('status', 'Reservado')
                .single();

            if (!usage) {
                alert('Você não tem reserva para este veículo');
                return;
            }

            const { error } = await supabase
                .from('vehicle_usage')
                .update({
                    status: 'Em Uso',
                    data_saida: getLocalDate(),
                    hora_saida: getLocalTime(),
                } as any)
                .eq('id', usage.id);

            if (error) throw error;
            alert('Saída registrada com sucesso!');
            fetchVehicles();
        } catch (error) {
            console.error('Error picking up vehicle:', error);
            alert('Erro ao registrar saída');
        }
    };

    const handleReturn = async (vehicleId: string) => {
        if (!user) return;

        try {
            const { data: usage } = await supabase
                .from('vehicle_usage')
                .select('*')
                .eq('vehicle_id', vehicleId)
                .eq('user_id', user.id)
                .eq('status', 'Em Uso')
                .single();

            if (!usage) {
                alert('Você não está usando este veículo');
                return;
            }

            const { error } = await supabase
                .from('vehicle_usage')
                .update({
                    status: 'Finalizado',
                    data_retorno: getLocalDate(),
                    hora_retorno: getLocalTime(),
                } as any)
                .eq('id', usage.id);

            if (error) throw error;
            alert('Devolução registrada com sucesso!');
            fetchVehicles();
        } catch (error) {
            console.error('Error returning vehicle:', error);
            alert('Erro ao registrar devolução');
        }
    };

    const getFilteredVehicles = () => {
        let filtered = vehicles;

        if (filter !== 'all') {
            filtered = filtered.filter(v => v.status === filter);
        }

        filtered = filtered.filter(v => {
            if (v.status === 'Em Uso' && v.current_user_id !== user?.id) {
                return false;
            }
            return true;
        });

        return filtered;
    };

    const filteredVehicles = getFilteredVehicles();

    const getStatusColor = (status: string) => {
        const colors = {
            'Disponível': '#10b981',
            'Em Uso': '#ef4444',
            'Reservado': '#f59e0b',
        };
        return colors[status as keyof typeof colors] || '#6366f1';
    };

    const canReturn = (vehicle: VehicleWithUsage) => {
        if (!user) return false;
        return vehicle.current_user_id === user.id;
    };

    const canPickup = (vehicle: VehicleWithUsage) => {
        if (!user) return false;
        return vehicle.current_user_id === user.id;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando frota...</p>
            </div>
        );
    }

    return (
        <div className="fleet-page">
            <div className="page-header">
                <div>
                    <h1>Frota de Veículos</h1>
                    <p className="text-muted">Visualize, reserve e gerencie o uso de veículos</p>
                </div>
            </div>

            {userHasActiveVehicle && (
                <div className="alert alert-info">
                    ℹ️ Você já possui um veículo reservado ou em uso. Devolva-o antes de reservar outro.
                </div>
            )}

            <div className="filter-bar">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todos ({getFilteredVehicles().length})
                </button>
                <button
                    className={`filter-btn ${filter === 'Disponível' ? 'active' : ''}`}
                    onClick={() => setFilter('Disponível')}
                >
                    🟢 Disponíveis ({vehicles.filter(v => v.status === 'Disponível').length})
                </button>
                <button
                    className={`filter-btn ${filter === 'Reservado' ? 'active' : ''}`}
                    onClick={() => setFilter('Reservado')}
                >
                    🟡 Reservados ({vehicles.filter(v => v.status === 'Reservado' && v.current_user_id === user?.id).length})
                </button>
                <button
                    className={`filter-btn ${filter === 'Em Uso' ? 'active' : ''}`}
                    onClick={() => setFilter('Em Uso')}
                >
                    🔴 Em Uso ({vehicles.filter(v => v.status === 'Em Uso' && v.current_user_id === user?.id).length})
                </button>
            </div>

            <div className="vehicles-grid">
                {filteredVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="vehicle-card">
                        <div className="vehicle-header">
                            <h3>{vehicle.veiculo}</h3>
                            <span
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(vehicle.status) }}
                            >
                                {vehicle.status}
                            </span>
                        </div>
                        <div className="vehicle-info">
                            <p><strong>Placa:</strong> {vehicle.placa}</p>
                            <p><strong>Empresa:</strong> {vehicle.empresa}</p>
                            <p><strong>Renavam:</strong> {vehicle.renavam}</p>
                            {vehicle.current_user_name && vehicle.status !== 'Disponível' && (
                                <p><strong>Condutor:</strong> {vehicle.current_user_name}</p>
                            )}
                        </div>
                        <div className="vehicle-actions">
                            {vehicle.status === 'Disponível' && (
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleReserve(vehicle.id, vehicle.veiculo)}
                                    disabled={userHasActiveVehicle}
                                >
                                    {userHasActiveVehicle ? '🔒 Já possui veículo' : '📅 Reservar'}
                                </button>
                            )}
                            {vehicle.status === 'Reservado' && canPickup(vehicle) && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handlePickup(vehicle.id)}
                                >
                                    🚗 Retirar
                                </button>
                            )}
                            {vehicle.status === 'Em Uso' && canReturn(vehicle) && (
                                <button
                                    className="btn btn-warning"
                                    onClick={() => handleReturn(vehicle.id)}
                                >
                                    ✅ Devolver
                                </button>
                            )}
                            {vehicle.status === 'Reservado' && !canPickup(vehicle) && (
                                <button className="btn btn-secondary" disabled>
                                    🔒 Reservado por outro usuário
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredVehicles.length === 0 && (
                <div className="empty-state">
                    <p>Nenhum veículo encontrado com este filtro</p>
                </div>
            )}
        </div>
    );
}
