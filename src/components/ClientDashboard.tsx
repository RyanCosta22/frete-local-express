import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Package, Plus, History } from 'lucide-react';
import OrderForm from '@/components/OrderForm';
import OrderHistory from '@/components/OrderHistory';

const ClientDashboard = () => {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('new-order');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Painel do Cliente</h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.email}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-order">
              <Plus className="w-4 h-4 mr-2" />
              Novo Pedido
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Meus Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-order" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Solicitar Frete
                </CardTitle>
                <CardDescription>
                  Preencha os dados do seu produto e escolha o melhor trecho para envio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <OrderHistory userType="client" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;