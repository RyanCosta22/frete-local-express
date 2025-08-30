import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Truck, CheckCircle, Clock } from 'lucide-react';
import CarrierRegistrationForm from '@/components/CarrierRegistrationForm';
import AvailableOrders from '@/components/AvailableOrders';
import OrderHistory from '@/components/OrderHistory';

const CarrierDashboard = () => {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isCarrierRegistered, setIsCarrierRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCarrierRegistration();
  }, [user]);

  const checkCarrierRegistration = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('carriers')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      setIsCarrierRegistered(!!data);
    } catch (error) {
      console.error('Error checking carrier registration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setIsCarrierRegistered(true);
    setActiveTab('available-orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Painel do Freteiro</h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.email}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!isCarrierRegistered ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Cadastro de Freteiro
              </CardTitle>
              <CardDescription>
                Complete seu cadastro para começar a receber pedidos de frete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CarrierRegistrationForm onSuccess={handleRegistrationSuccess} />
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                <Truck className="w-4 h-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="available-orders">
                <Clock className="w-4 h-4 mr-2" />
                Pedidos Disponíveis
              </TabsTrigger>
              <TabsTrigger value="my-orders">
                <CheckCircle className="w-4 h-4 mr-2" />
                Meus Pedidos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Freteiro</CardTitle>
                  <CardDescription>
                    Suas informações de cadastro como transportador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CarrierRegistrationForm onSuccess={handleRegistrationSuccess} isEdit />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="available-orders" className="mt-6">
              <AvailableOrders />
            </TabsContent>

            <TabsContent value="my-orders" className="mt-6">
              <OrderHistory userType="carrier" />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default CarrierDashboard;