import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Copy, Pencil, Trash2, Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import RoutineDialog from "@/components/RoutineDialog";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Routines() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  
  const { data: routines, isLoading } = trpc.routines.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const utils = trpc.useUtils();
  
  const startWorkoutMutation = trpc.workouts.start.useMutation({
    onSuccess: (data: any) => {
      toast.success("Treino iniciado!");
      if (data && typeof data === 'object' && 'insertId' in data) {
        setLocation(`/workout/${data.insertId}`);
      }
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
  
  const deleteMutation = trpc.routines.delete.useMutation({
    onSuccess: () => {
      toast.success("Rotina deletada!");
      utils.routines.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
  
  const duplicateMutation = trpc.routines.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Rotina duplicada!");
      utils.routines.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Rotinas</h1>
            <p className="text-muted-foreground">Gerencie seus treinos</p>
          </div>
          <Button size="sm" onClick={() => {
            setEditingId(undefined);
            setDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Nova
          </Button>
        </div>

        {!routines || routines.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem rotinas de treino.
            </p>
            <Button onClick={() => {
              setEditingId(undefined);
              setDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Rotina
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {routines.map((routine) => (
              <Card key={routine.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{routine.name}</h3>
                    {routine.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {routine.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => startWorkoutMutation.mutate({ 
                      routineId: routine.id,
                      name: routine.name 
                    })}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Iniciar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEditingId(routine.id);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => duplicateMutation.mutate({ id: routine.id })}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (window.confirm('Deseja deletar esta rotina?')) {
                        deleteMutation.mutate({ id: routine.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <RoutineDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          routineId={editingId}
          onSuccess={() => setDialogOpen(false)}
        />
      </div>
    </div>
  );
}
