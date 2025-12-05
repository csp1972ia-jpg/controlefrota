import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/Infractions.css';

export function Infractions() {
    const [infractions, setInfractions] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedInfraction, setSelectedInfraction] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        vehicle_id: '',
        auto_infracao: '',
        renainf: '',
        multa_original: '',
        status: 'Pendente',
        tipo_infracao: '',
        data_infracao: '',
        local: '',
        horario: '',
        infracao: '',
        valor_original: '',
        valor_liquido: '',
        prazo_recurso: '',
        prazo_identificacao: '',
        vencimento: '',
        boleto_impresso: false,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [infractionsRes, vehiclesRes] = await Promise.all([
                supabase.from('infractions').select('*').order('data_infracao', { ascending: false }),
                supabase.from('vehicles').select('id, veiculo, placa'),
            ]);

            setInfractions(infractionsRes.data || []);
            setVehicles(vehiclesRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const vehicle = vehicles.find(v => v.id === formData.vehicle_id);

            const infractionData = {
                vehicle_id: formData.vehicle_id,
                veiculo: vehicle?.veiculo || '',
                auto_infracao: formData.auto_infracao,
                renainf: formData.renainf || null,
                multa_original: formData.multa_original ? parseFloat(formData.multa_original) : null,
                status: formData.status || 'Pendente',
                tipo_infracao: formData.tipo_infracao || null,
                data_infracao: formData.data_infracao,
                local: formData.local || null,
                horario: formData.horario || null,
                infracao: formData.infracao || null,
                valor_original: formData.valor_original ? parseFloat(formData.valor_original) : null,
                valor_liquido: formData.valor_liquido ? parseFloat(formData.valor_liquido) : null,
                prazo_recurso: formData.prazo_recurso || null,
                prazo_identificacao: formData.prazo_identificacao || null,
                vencimento: formData.vencimento || null,
                boleto_impresso: formData.boleto_impresso,
            };

            let error;

            if (selectedInfraction) {
                // Modo de edição
                const result = await supabase
                    .from('infractions')
                    .update(infractionData as any)
                    .eq('id', selectedInfraction.id);
                error = result.error;
            } else {
                // Modo de criação
                const result = await supabase
                    .from('infractions')
                    .insert([infractionData as any]);
                error = result.error;
            }

            if (error) throw error;

            alert(selectedInfraction ? 'Infração atualizada com sucesso!' : 'Infração cadastrada! O condutor foi identificado automaticamente.');
            setShowModal(false);
            setSelectedInfraction(null);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving infraction:', error);
            alert('Erro ao salvar infração');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            vehicle_id: '',
            auto_infracao: '',
            renainf: '',
            multa_original: '',
            status: 'Pendente',
            tipo_infracao: '',
            data_infracao: '',
            local: '',
            horario: '',
            infracao: '',
            valor_original: '',
            valor_liquido: '',
            prazo_recurso: '',
            prazo_identificacao: '',
            vencimento: '',
            boleto_impresso: false,
        });
    };

    const handleEdit = (infraction: any) => {
        setFormData({
            vehicle_id: infraction.vehicle_id || '',
            auto_infracao: infraction.auto_infracao || '',
            renainf: infraction.renainf || '',
            multa_original: infraction.multa_original?.toString() || '',
            status: infraction.status || 'Pendente',
            tipo_infracao: infraction.tipo_infracao || '',
            data_infracao: infraction.data_infracao || '',
            local: infraction.local || '',
            horario: infraction.horario || '',
            infracao: infraction.infracao || '',
            valor_original: infraction.valor_original?.toString() || '',
            valor_liquido: infraction.valor_liquido?.toString() || '',
            prazo_recurso: infraction.prazo_recurso || '',
            prazo_identificacao: infraction.prazo_identificacao || '',
            vencimento: infraction.vencimento || '',
            boleto_impresso: infraction.boleto_impresso || false,
        });
        setSelectedInfraction(infraction);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedInfraction(null);
        resetForm();
    };

    const filteredInfractions = infractions.filter(infraction => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            infraction.auto_infracao?.toLowerCase().includes(search) ||
            infraction.veiculo?.toLowerCase().includes(search) ||
            vehicles.find(v => v.id === infraction.vehicle_id)?.placa?.toLowerCase().includes(search)
        );
    });

    if (loading && infractions.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando infrações...</p>
            </div>
        );
    }

    return (
        <div className="infractions-page">
            <div className="page-header">
                <div>
                    <h1>Gerenciamento de Infrações</h1>
                    <p className="text-muted">Cadastre infrações e identifique condutores automaticamente</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ➕ Nova Infração
                </button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="🔍 Buscar por placa, veículo ou auto de infração..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                {searchTerm && (
                    <button className="btn btn-secondary" onClick={() => setSearchTerm('')}>
                        ✕ Limpar
                    </button>
                )}
            </div>

            {filteredInfractions.length === 0 && !searchTerm ? (
                <div className="empty-state">
                    <p>📦 Nenhuma infração cadastrada</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        Cadastrar Primeira Infração
                    </button>
                </div>
            ) : filteredInfractions.length === 0 ? (
                <div className="empty-state">
                    <p>🔍 Nenhuma infração encontrada com "{searchTerm}"</p>
                    <button className="btn btn-secondary" onClick={() => setSearchTerm('')}>
                        Limpar Busca
                    </button>
                </div>
            ) : (
                <div className="infractions-table-container">
                    <table className="infractions-table">
                        <thead>
                            <tr>
                                <th>Auto Infração</th>
                                <th>Veículo</th>
                                <th>Data</th>
                                <th>Tipo</th>
                                <th>Infrator</th>
                                <th>Identificado</th>
                                <th>Valor Original</th>
                                <th>Valor Líquido</th>
                                <th>Vencimento</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInfractions.map((infraction) => (
                                <tr
                                    key={infraction.id}
                                    className="clickable-row"
                                    onClick={() => handleEdit(infraction)}
                                >
                                    <td className="font-bold">{infraction.auto_infracao}</td>
                                    <td>{infraction.veiculo}</td>
                                    <td>{new Date(infraction.data_infracao).toLocaleDateString('pt-BR')}</td>
                                    <td>{infraction.tipo_infracao || '-'}</td>
                                    <td>{infraction.infrator || 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${infraction.condutor_identificado === 'SIM' ? 'badge-success' : 'badge-danger'}`}>
                                            {infraction.condutor_identificado || 'NÃO'}
                                        </span>
                                    </td>
                                    <td>
                                        {infraction.valor_original
                                            ? `R$ ${Number(infraction.valor_original).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                            : '-'}
                                    </td>
                                    <td>
                                        {infraction.valor_liquido
                                            ? `R$ ${Number(infraction.valor_liquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                            : '-'}
                                    </td>
                                    <td>
                                        {infraction.vencimento
                                            ? new Date(infraction.vencimento).toLocaleDateString('pt-BR')
                                            : '-'}
                                    </td>
                                    <td>{infraction.status || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedInfraction ? 'Editar Infração' : 'Nova Infração'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="infraction-form">
                            <div className="alert alert-info">
                                ℹ️ O condutor será identificado automaticamente pela data da infração
                            </div>

                            <h3 className="form-section-title">Informações Básicas</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="vehicle_id">Veículo *</label>
                                    <select
                                        id="vehicle_id"
                                        value={formData.vehicle_id}
                                        onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Selecione um veículo</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.veiculo} - {v.placa}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="auto_infracao">Auto de Infração *</label>
                                    <input
                                        id="auto_infracao"
                                        type="text"
                                        value={formData.auto_infracao}
                                        onChange={(e) => setFormData({ ...formData, auto_infracao: e.target.value })}
                                        placeholder="Ex: 123456789"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="renainf">Renainf</label>
                                    <input
                                        id="renainf"
                                        type="text"
                                        value={formData.renainf}
                                        onChange={(e) => setFormData({ ...formData, renainf: e.target.value })}
                                        placeholder="Número Renainf"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="data_infracao">Data da Infração *</label>
                                    <input
                                        id="data_infracao"
                                        type="date"
                                        value={formData.data_infracao}
                                        onChange={(e) => setFormData({ ...formData, data_infracao: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="horario">Horário</label>
                                    <input
                                        id="horario"
                                        type="time"
                                        value={formData.horario}
                                        onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="tipo_infracao">Tipo de Infração</label>
                                    <input
                                        id="tipo_infracao"
                                        type="text"
                                        value={formData.tipo_infracao}
                                        onChange={(e) => setFormData({ ...formData, tipo_infracao: e.target.value })}
                                        placeholder="Ex: Excesso de velocidade"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="local">Local</label>
                                <input
                                    id="local"
                                    type="text"
                                    value={formData.local}
                                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                                    placeholder="Endereço ou local da infração"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="infracao">Descrição da Infração</label>
                                <textarea
                                    id="infracao"
                                    value={formData.infracao}
                                    onChange={(e) => setFormData({ ...formData, infracao: e.target.value })}
                                    placeholder="Descreva a infração"
                                    rows={3}
                                />
                            </div>

                            <h3 className="form-section-title">Valores e Prazos</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="multa_original">Multa Original (R$)</label>
                                    <input
                                        id="multa_original"
                                        type="number"
                                        step="0.01"
                                        value={formData.multa_original}
                                        onChange={(e) => setFormData({ ...formData, multa_original: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="valor_original">Valor Original (R$)</label>
                                    <input
                                        id="valor_original"
                                        type="number"
                                        step="0.01"
                                        value={formData.valor_original}
                                        onChange={(e) => setFormData({ ...formData, valor_original: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="valor_liquido">Valor Líquido (R$)</label>
                                    <input
                                        id="valor_liquido"
                                        type="number"
                                        step="0.01"
                                        value={formData.valor_liquido}
                                        onChange={(e) => setFormData({ ...formData, valor_liquido: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="prazo_recurso">Prazo Recurso</label>
                                    <input
                                        id="prazo_recurso"
                                        type="date"
                                        value={formData.prazo_recurso}
                                        onChange={(e) => setFormData({ ...formData, prazo_recurso: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="prazo_identificacao">Prazo Identificação</label>
                                    <input
                                        id="prazo_identificacao"
                                        type="date"
                                        value={formData.prazo_identificacao}
                                        onChange={(e) => setFormData({ ...formData, prazo_identificacao: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="vencimento">Vencimento</label>
                                    <input
                                        id="vencimento"
                                        type="date"
                                        value={formData.vencimento}
                                        onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
                                    />
                                </div>
                            </div>

                            <h3 className="form-section-title">Status e Controle</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="status">Status</label>
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Pendente">Pendente</option>
                                        <option value="Pago">Pago</option>
                                        <option value="Recorrido">Recorrido</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.boleto_impresso}
                                            onChange={(e) => setFormData({ ...formData, boleto_impresso: e.target.checked })}
                                        />
                                        <span>Boleto Impresso</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedInfraction && (
                <div className="modal-overlay" onClick={() => setSelectedInfraction(null)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detalhes da Infração</h2>
                            <button className="modal-close" onClick={() => setSelectedInfraction(null)}>✕</button>
                        </div>

                        <div className="details-content">
                            <div className="detail-section">
                                <h3>Informações Básicas</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Auto de Infração:</strong>
                                        <span>{selectedInfraction.auto_infracao}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Renainf:</strong>
                                        <span>{selectedInfraction.renainf || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Veículo:</strong>
                                        <span>{selectedInfraction.veiculo}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Data da Infração:</strong>
                                        <span>{new Date(selectedInfraction.data_infracao).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Horário:</strong>
                                        <span>{selectedInfraction.horario || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Tipo de Infração:</strong>
                                        <span>{selectedInfraction.tipo_infracao || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Local:</strong>
                                        <span>{selectedInfraction.local || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Descrição</h3>
                                <p>{selectedInfraction.infracao || 'Sem descrição'}</p>
                            </div>

                            <div className="detail-section">
                                <h3>Condutor</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Infrator:</strong>
                                        <span>{selectedInfraction.infrator || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Condutor Identificado:</strong>
                                        <span className={`badge ${selectedInfraction.condutor_identificado === 'SIM' ? 'badge-success' : 'badge-danger'}`}>
                                            {selectedInfraction.condutor_identificado || 'NÃO'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Valores</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Multa Original:</strong>
                                        <span>
                                            {selectedInfraction.multa_original
                                                ? `R$ ${Number(selectedInfraction.multa_original).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Valor Original:</strong>
                                        <span>
                                            {selectedInfraction.valor_original
                                                ? `R$ ${Number(selectedInfraction.valor_original).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Valor Líquido:</strong>
                                        <span>
                                            {selectedInfraction.valor_liquido
                                                ? `R$ ${Number(selectedInfraction.valor_liquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                                : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Prazos</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Prazo Recurso:</strong>
                                        <span>
                                            {selectedInfraction.prazo_recurso
                                                ? new Date(selectedInfraction.prazo_recurso).toLocaleDateString('pt-BR')
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Prazo Identificação:</strong>
                                        <span>
                                            {selectedInfraction.prazo_identificacao
                                                ? new Date(selectedInfraction.prazo_identificacao).toLocaleDateString('pt-BR')
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Vencimento:</strong>
                                        <span>
                                            {selectedInfraction.vencimento
                                                ? new Date(selectedInfraction.vencimento).toLocaleDateString('pt-BR')
                                                : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Status e Controle</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Status:</strong>
                                        <span>{selectedInfraction.status || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Boleto Impresso:</strong>
                                        <span className={`badge ${selectedInfraction.boleto_impresso ? 'badge-success' : 'badge-danger'}`}>
                                            {selectedInfraction.boleto_impresso ? 'SIM' : 'NÃO'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setSelectedInfraction(null)}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
