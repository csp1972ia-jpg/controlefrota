import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import '../styles/Dashboard.css';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    inUseVehicles: 0,
    reservedVehicles: 0,
    totalInfractions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: vehicles } = await supabase.from('vehicles').select('status');
      const { data: infractions } = await supabase.from('infractions').select('id');

      const vehiclesArray = vehicles || [];
      
      setStats({
        totalVehicles: vehiclesArray.length,
        availableVehicles: vehiclesArray.filter((v: any) => v.status === 'Disponível').length,
        inUseVehicles: vehiclesArray.filter((v: any) => v.status === 'Em Uso').length,
        reservedVehicles: vehiclesArray.filter((v: any) => v.status === 'Reservado').length,
        totalInfractions: infractions?.length || 0,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard - Controle de Frota</h1>
        <p className="text-muted">Bem-vindo, {user?.nome_condutor}! 👋</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>🚗</div>
          <div className="stat-content">
            <p className="stat-label">Total de Veículos</p>
            <h2 className="stat-value">{stats.totalVehicles}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>✅</div>
          <div className="stat-content">
            <p className="stat-label">Disponíveis</p>
            <h2 className="stat-value">{stats.availableVehicles}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>🔴</div>
          <div className="stat-content">
            <p className="stat-label">Em Uso</p>
            <h2 className="stat-value">{stats.inUseVehicles}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>⏳</div>
          <div className="stat-content">
            <p className="stat-label">Reservados</p>
            <h2 className="stat-value">{stats.reservedVehicles}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>⚠️</div>
          <div className="stat-content">
            <p className="stat-label">Total de Infrações</p>
            <h2 className="stat-value">{stats.totalInfractions}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
