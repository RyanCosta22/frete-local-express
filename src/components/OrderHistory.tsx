import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Weight, DollarSign, Phone, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderHistoryProps {
  userType: 'client' | 'carrier';
}

interface Order {
  id: string;
  product_description: string;
  weight_kg: number;
  total_price: number;
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
  pickup_date?: string;
  delivery_date?: string;
  created_at: string;
  notes?: string;
  client_profile?: {
    full_name: string;
    phone?: string;
  };
  carrier_profile?: {
    full_name: string;
    phone?: string;
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

const OrderHistory = ({ userType }: OrderHistoryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, userType]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          client_profile:profiles!orders_client_id_fkey(full_name, phone),
          carrier_profile:profiles!orders_carrier_id_fkey(full_name, phone),
          pickup_location:locations!orders_pickup_location_id_fkey(name, address, city),
          delivery_location:locations!orders_delivery_location_id_fkey(name, address, city),
          routes!orders_route_id_fkey(distance_km, estimated_time_hours)
        `);

      if (userType === 'client') {
        query = query.eq('client_id', user.id);
      } else {
        query = query.eq('carrier_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as any || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'in_transit') {
        updates.pickup_date = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updates.delivery_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: `Pedido marcado como ${getStatusText(newStatus).toLowerCase()}.`,
      });

      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Aceito';
      case 'in_transit':
        return 'Em Trânsito';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) return <div>Carregando histórico...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {userType === 'client' ? 'Meus Pedidos' : 'Pedidos Aceitos'}
        </h2>
        <p className="text-muted-foreground">
          {userType === 'client' 
            ? 'Histórico dos seus pedidos de frete' 
            : 'Pedidos que você aceitou transportar'
          }
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground">
                {userType === 'client' 
                  ? 'Você ainda não fez nenhum pedido de frete.' 
                  : 'Você ainda não aceitou nenhum pedido.'
                }
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
                      {userType === 'client' 
                        ? `Freteiro: ${order.carrier_profile?.full_name || 'Não atribuído'}`
                        : `Cliente: ${order.client_profile?.full_name}`
                      }
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
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

                {order.notes && (
                  <div>
                    <h4 className="font-medium mb-1">Observações</h4>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-muted-foreground">
                    <p>Criado: {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                    {order.pickup_date && (
                      <p>Retirada: {new Date(order.pickup_date).toLocaleDateString('pt-BR')}</p>
                    )}
                    {order.delivery_date && (
                      <p>Entrega: {new Date(order.delivery_date).toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {userType === 'carrier' && order.status === 'accepted' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateOrderStatus(order.id, 'in_transit')}
                      >
                        Iniciar Transporte
                      </Button>
                    )}
                    {userType === 'carrier' && order.status === 'in_transit' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Entregue
                      </Button>
                    )}
                    {((userType === 'client' && order.carrier_profile) || 
                      (userType === 'carrier' && order.client_profile)) && (
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Contato
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;