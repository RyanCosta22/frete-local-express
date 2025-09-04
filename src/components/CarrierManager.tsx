import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Truck, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Carrier {
  id: string;
  vehicle_type: string;
  vehicle_plate: string;
  driver_license?: string;
  is_active: boolean;
  rating: number;
  profiles: {
    full_name: string;
    phone?: string;
  };
}

const CarrierManager = () => {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCarriers();
  }, []);

  const fetchCarriers = async () => {
    try {
      const { data, error } = await supabase
        .from('carriers')
        .select(`
          *,
          profiles(full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCarriers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar freteiros",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  if (loading) return <div>Carregando freteiros...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciar Freteiros</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Freteiros Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {carriers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum freteiro cadastrado ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>CNH</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carriers.map((carrier) => (
                  <TableRow key={carrier.id}>
                    <TableCell className="font-medium">
                      {carrier.profiles.full_name}
                    </TableCell>
                    <TableCell>
                      {carrier.profiles.phone || 'Não informado'}
                    </TableCell>
                    <TableCell>{carrier.vehicle_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{carrier.vehicle_plate}</Badge>
                    </TableCell>
                    <TableCell>
                      {carrier.driver_license || 'Não informado'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {renderRating(carrier.rating)}
                        <span className="text-sm text-muted-foreground">
                          {carrier.rating.toFixed(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={carrier.is_active ? "default" : "secondary"}
                      >
                        {carrier.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
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

export default CarrierManager;