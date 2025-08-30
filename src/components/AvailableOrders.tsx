import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Weight, DollarSign, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvailableOrder {
  id: string;
  product_description: string;
  weight_kg: number;
  total_price: number;
  created_at: string;
  client_profile: {
    full_name: string;
  };
  pickup_location: {
    name: string;
    address: string;
    city: string;
  };
  delivery_location: {
    name: string;
    address: string;
    city: string;
  };
  routes: {
    distance_km: number;
    estimated_time_hours: number;
  };
}

const AvailableOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client_profile:profiles!orders_client_id_fkey(full_name),
          pickup_location:locations!orders_pickup_location_id_fkey(name, address, city),
          delivery_location:locations!orders_delivery_location_id_fkey(name, address, city),
          routes!orders_route_id_fkey(distance_km, estimated_time_hours)
        `)
        .eq('status', 'pending')
        .is('carrier_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as any || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar pedidos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          carrier_id: user.id,
          status: 'accepted'
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Pedido aceito!",
        description: "O pedido foi atribuído a você. Entre em contato com o cliente.",
      });

      fetchAvailableOrders();
    } catch (error: any) {
      toast({
        title: "Erro ao aceitar pedido",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Carregando pedidos disponíveis...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pedidos Disponíveis</h2>
        <p className="text-muted-foreground">
          Escolha os fretes que deseja transportar
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum pedido disponível</h3>
              <p className="text-muted-foreground">
                Não há pedidos aguardando freteiros no momento. 
                Volte mais tarde para ver novas oportunidades.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {order.product_description}
                    </CardTitle>
                    <CardDescription>
                      Cliente: {order.client_profile?.full_name}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    Novo Pedido
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <span>{order.weight_kg} kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-green-600">
                      R$ {order.total_price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{order.routes?.distance_km} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{order.routes?.estimated_time_hours}h</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-1">Retirada</h4>
                    <p className="text-sm">{order.pickup_location?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.pickup_location?.city}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 mb-1">Entrega</h4>
                    <p className="text-sm">{order.delivery_location?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.delivery_location?.city}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    Criado em: {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <Button onClick={() => acceptOrder(order.id)}>
                    Aceitar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableOrders;