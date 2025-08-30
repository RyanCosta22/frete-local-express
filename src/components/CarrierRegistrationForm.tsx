import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CarrierRegistrationFormProps {
  onSuccess: () => void;
  isEdit?: boolean;
}

const CarrierRegistrationForm = ({ onSuccess, isEdit = false }: CarrierRegistrationFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);

  useEffect(() => {
    if (isEdit && user) {
      fetchExistingData();
    }
  }, [isEdit, user]);

  const fetchExistingData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('carriers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setExistingData(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const carrierData = {
      user_id: user.id,
      vehicle_type: formData.get('vehicle_type') as string,
      vehicle_plate: formData.get('vehicle_plate') as string,
      driver_license: formData.get('driver_license') as string || null,
    };

    try {
      let error;
      
      if (existingData) {
        // Update existing carrier
        const { error: updateError } = await supabase
          .from('carriers')
          .update(carrierData)
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Insert new carrier
        const { error: insertError } = await supabase
          .from('carriers')
          .insert(carrierData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: existingData ? "Dados atualizados!" : "Cadastro realizado!",
        description: existingData 
          ? "Suas informações foram atualizadas com sucesso."
          : "Agora você pode receber pedidos de frete.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle_type">Tipo do Veículo</Label>
          <Input
            id="vehicle_type"
            name="vehicle_type"
            placeholder="Ex: Caminhão, Van, Moto"
            defaultValue={existingData?.vehicle_type || ''}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vehicle_plate">Placa do Veículo</Label>
          <Input
            id="vehicle_plate"
            name="vehicle_plate"
            placeholder="Ex: ABC-1234"
            defaultValue={existingData?.vehicle_plate || ''}
            required
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="driver_license">CNH (Opcional)</Label>
          <Input
            id="driver_license"
            name="driver_license"
            placeholder="Ex: 12345678901"
            defaultValue={existingData?.driver_license || ''}
          />
        </div>
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading 
          ? 'Salvando...' 
          : existingData 
            ? 'Atualizar Dados' 
            : 'Completar Cadastro'
        }
      </Button>
    </form>
  );
};

export default CarrierRegistrationForm;