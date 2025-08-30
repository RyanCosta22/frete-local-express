import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Location {
  id: string;
  name: string;
  city: string;
}

interface Route {
  id: string;
  origin_id: string;
  destination_id: string;
  distance_km: number;
  estimated_time_hours: number;
  base_price: number;
  price_per_kg: number;
  origin: Location;
  destination: Location;
}

const OrderForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [weight, setWeight] = useState<number>(0);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute && weight > 0) {
      const totalPrice = selectedRoute.base_price + (selectedRoute.price_per_kg * weight);
      setCalculatedPrice(totalPrice);
    } else {
      setCalculatedPrice(0);
    }
  }, [selectedRoute, weight]);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          origin:locations!origin_id(id, name, city),
          destination:locations!destination_id(id, name, city)
        `)
        .eq('is_active', true)
        .order('base_price');

      if (error) throw error;
      setRoutes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar trechos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRouteChange = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    setSelectedRoute(route || null);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = parseFloat(e.target.value) || 0;
    setWeight(newWeight);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedRoute) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const orderData = {
      client_id: user.id,
      route_id: selectedRoute.id,
      pickup_location_id: selectedRoute.origin_id,
      delivery_location_id: selectedRoute.destination_id,
      product_description: formData.get('product_description') as string,
      weight_kg: weight,
      total_price: calculatedPrice,
      notes: formData.get('notes') as string || null,
    };

    try {
      const { error } = await supabase
        .from('orders')
        .insert(orderData);

      if (error) throw error;

      toast({
        title: "Pedido criado com sucesso!",
        description: "Seu pedido foi enviado e está aguardando um freteiro aceitar.",
      });

      // Reset form
      (e.target as HTMLFormElement).reset();
      setSelectedRoute(null);
      setWeight(0);
      setCalculatedPrice(0);
    } catch (error: any) {
      toast({
        title: "Erro ao criar pedido",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product_description">Descrição do Produto</Label>
            <Input
              id="product_description"
              name="product_description"
              placeholder="Ex: Caixa com eletrônicos"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              placeholder="Ex: 15.5"
              onChange={handleWeightChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="route">Selecionar Trecho</Label>
          <Select onValueChange={handleRouteChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Escolha origem e destino" />
            </SelectTrigger>
            <SelectContent>
              {routes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>
                      {route.origin?.name} → {route.destination?.name}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({route.distance_km}km - R$ {route.base_price.toFixed(2)} + R$ {route.price_per_kg.toFixed(2)}/kg)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {routes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum trecho disponível. Entre em contato com o administrador.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações (Opcional)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Informações adicionais sobre o produto ou entrega..."
          />
        </div>

        {selectedRoute && weight > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Cálculo do Frete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Preço base do trecho:</span>
                  <span>R$ {selectedRoute.base_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peso ({weight} kg × R$ {selectedRoute.price_per_kg.toFixed(2)}):</span>
                  <span>R$ {(selectedRoute.price_per_kg * weight).toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {calculatedPrice.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Distância: {selectedRoute.distance_km} km</p>
                  <p>Tempo estimado: {selectedRoute.estimated_time_hours} horas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !selectedRoute || weight <= 0}
        >
          {loading ? 'Criando Pedido...' : 'Solicitar Frete'}
        </Button>
      </form>
    </div>
  );
};

export default OrderForm;