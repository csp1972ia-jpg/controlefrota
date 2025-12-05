import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import '../styles/Vehicles.css';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

export function Vehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState({
        placa: '',
        renavam: '',
        veiculo: '',
        empresa: '',
        status: 'Disponível' as 'Disponível' | 'Em Uso' | 'Reservado',
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVehicles(data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingVehicle) {
                // Update existing vehicle
                const { error } = await supabase
                    .from('vehicles')
                    .update(formData)
                    .eq('id', editingVehicle.id);

                if (error) throw error;
            } else {
                // Create new vehicle
                const { error } = await supabase
                    .from('vehicles')
                    .insert([formData as any]);

                if (error) throw error;
            }

            setShowModal(false);
            setEditingVehicle(null);
            resetForm();
            fetchVehicles();
        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('Erro ao salvar veículo');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            placa: vehicle.placa,
            renavam: vehicle.renavam,
            veiculo: vehicle.veiculo,
            empresa: vehicle.empresa,
            status: vehicle.status,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este veículo?')) return;

        try {
            const { error } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchVehicles();
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Erro ao excluir veículo');
        }
    };

    const resetForm = () => {
        setFormData({
            placa: '',
            renavam: '',
            veiculo: '',
            empresa: '',
            status: 'Disponível',
        });
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            'Disponível': 'badge-success',
            'Em Uso': 'badge-danger',
            'Reservado': 'badge-warning',
        };
        return badges[status as keyof typeof badges] || 'badge-info';
    };

    if (loading && vehicles.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando veículos...</p>
            </div>
        );
    }

    return (
        <div className="vehicles-page">
            <div className="page-header">
                <div>
                    <h1>Gerenciamento de Veículos</h1>
                    <p className="text-muted">Cadastre, edite e gerencie a frota de veículos</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingVehicle(null);
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    ➕ Novo Veículo
                </button>
            </div>

            {vehicles.length === 0 ? (
                <div className="empty-state">
                    <p>📦 Nenhum veículo cadastrado</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        Cadastrar Primeiro Veículo
                    </button>
                </div>
            ) : (
                <div className="vehicles-table-container">
                    <table className="vehicles-table">
                        <thead>
                            <tr>
                                <th>Placa</th>
                                <th>Veículo</th>
                                <th>Renavam</th>
                                <th>Empresa</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle.id}>
                                    <td className="font-bold">{vehicle.placa}</td>
                                    <td>{vehicle.veiculo}</td>
                                    <td>{vehicle.renavam}</td>
                                    <td>{vehicle.empresa}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(vehicle.status)}`}>
                                            {vehicle.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon btn-edit"
                                                onClick={() => handleEdit(vehicle)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(vehicle.id)}
                                                title="Excluir"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="vehicle-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="placa">Placa *</label>
                                    <input
                                        id="placa"
                                        type="text"
                                        value={formData.placa}
                                        onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                                        placeholder="ABC-1234"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="renavam">Renavam *</label>
                                    <input
                                        id="renavam"
                                        type="text"
                                        value={formData.renavam}
                                        onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                                        placeholder="12345678901"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="veiculo">Veículo (Modelo) *</label>
                                <input
                                    id="veiculo"
                                    type="text"
                                    value={formData.veiculo}
                                    onChange={(e) => setFormData({ ...formData, veiculo: e.target.value })}
                                    placeholder="Ex: Fiat Uno, VW Gol, etc."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="empresa">Empresa *</label>
                                <input
                                    id="empresa"
                                    type="text"
                                    value={formData.empresa}
                                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                    placeholder="Nome da empresa"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Status *</label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    required
                                >
                                    <option value="Disponível">Disponível</option>
                                    <option value="Em Uso">Em Uso</option>
                                    <option value="Reservado">Reservado</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Salvando...' : editingVehicle ? 'Atualizar' : 'Cadastrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
