import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Vehicles } from './pages/Vehicles';
import { Fleet } from './pages/Fleet';
import { MyUsage } from './pages/MyUsage';
import { MyInfractions } from './pages/MyInfractions';
import { Infractions } from './pages/Infractions';
import { Users } from './pages/Users';
import { UsageHistory } from './pages/UsageHistory';
import { Reservations } from './pages/Reservations';
import './styles/index.css';

function AppRoutes() {
  const { user } = useAuth();

  // Redirect based on user role
  const HomeRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    return user.permissoes === 'ADMIN' ? <Navigate to="/dashboard" replace /> : <Navigate to="/fleet" replace />;
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <HomeRedirect /> : <Login />}
      />

      {/* ADMIN Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vehicles"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <Vehicles />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/infractions"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <Infractions />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/usage-history"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <UsageHistory />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservations"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <Reservations />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* USER Routes */}
      <Route
        path="/fleet"
        element={
          <ProtectedRoute>
            <Layout>
              <Fleet />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-usage"
        element={
          <ProtectedRoute>
            <Layout>
              <MyUsage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-infractions"
        element={
          <ProtectedRoute>
            <Layout>
              <MyInfractions />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
