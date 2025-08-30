import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Route, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Location {
  id: string;
  name: string;
  city: string;
}

interface RouteData {
  id: string;
  origin_id: string;
  destination_id: string;
  distance_km: number;
  estimated_time_hours: number;
  base_price: number;
  price_per_kg: number;
  is_active: boolean;
  locations?: {
    origin: Location;
    destination: Location;
  };
}

const RouteManager = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch locations for the form
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, name, city')
        .eq('is_active', true)
        .order('name');

      if (locationsError) throw locationsError;
      setLocations(locationsData || []);

      // Fetch routes with location details
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select(`
          *,
          origin:locations!origin_id(id, name, city),
          destination:locations!destination_id(id, name, city)
        `)
        .order('base_price');

      if (routesError) throw routesError;
      setRoutes(routesData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const routeData = {
      origin_id: formData.get('origin_id') as string,
      destination_id: formData.get('destination_id') as string,
      distance_km: parseFloat(formData.get('distance_km') as string),
      estimated_time_hours: parseFloat(formData.get('estimated_time_hours') as string),
      base_price: parseFloat(formData.get('base_price') as string),
      price_per_kg: parseFloat(formData.get('price_per_kg') as string) || 0,
    };

    if (routeData.origin_id === routeData.destination_id) {
      toast({
        title: "Erro",
        description: "Origem e destino não podem ser iguais",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('routes')
        .insert(routeData);

      if (error) throw error;

      toast({
        title: "Trecho cadastrado com sucesso!",
        description: "O novo trecho foi adicionado ao sistema.",
      });

      setShowForm(false);
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar trecho",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleRouteStatus = async (routeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({ is_active: !currentStatus })
        .eq('id', routeId);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: `Trecho ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Carregando trechos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Trechos</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancelar' : 'Novo Trecho'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Trecho</CardTitle>
            <CardDescription>Adicione uma nova rota de frete com preços</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin_id">Local de Origem</Label>
                <Select name="origin_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} - {location.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination_id">Local de Destino</Label>
                <Select name="destination_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} - {location.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="distance_km">Distância (km)</Label>
                <Input 
                  id="distance_km" 
                  name="distance_km" 
                  type="number" 
                  step="0.1" 
                  placeholder="Ex: 150.5" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimated_time_hours">Tempo Estimado (horas)</Label>
                <Input 
                  id="estimated_time_hours" 
                  name="estimated_time_hours" 
                  type="number" 
                  step="0.1" 
                  placeholder="Ex: 2.5" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base_price">Preço Base (R$)</Label>
                <Input 
                  id="base_price" 
                  name="base_price" 
                  type="number" 
                  step="0.01" 
                  placeholder="Ex: 50.00" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price_per_kg">Preço por kg (R$)</Label>
                <Input 
                  id="price_per_kg" 
                  name="price_per_kg" 
                  type="number" 
                  step="0.01" 
                  placeholder="Ex: 2.50" 
                />
              </div>
              
              <div className="md:col-span-2">
                <Button type="submit">Cadastrar Trecho</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            Trechos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum trecho cadastrado ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Distância</TableHead>
                  <TableHead>Tempo</TableHead>
                  <TableHead>Preço Base</TableHead>
                  <TableHead>Por kg</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>{(route as any).origin?.name}</TableCell>
                    <TableCell>{(route as any).destination?.name}</TableCell>
                    <TableCell>{route.distance_km} km</TableCell>
                    <TableCell>{route.estimated_time_hours}h</TableCell>
                    <TableCell>R$ {route.base_price.toFixed(2)}</TableCell>
                    <TableCell>R$ {route.price_per_kg.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        route.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {route.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRouteStatus(route.id, route.is_active)}
                      >
                        {route.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteManager;