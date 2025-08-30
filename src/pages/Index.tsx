import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/AdminDashboard';
import ClientDashboard from '@/components/ClientDashboard';
import CarrierDashboard from '@/components/CarrierDashboard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on user role
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'client':
      return <ClientDashboard />;
    case 'carrier':
      return <CarrierDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

export default Index;
