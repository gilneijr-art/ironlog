import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState, useMemo } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseDialog from "@/components/ExerciseDialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Exercises() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  
  const { data: exercises, isLoading } = trpc.exercises.list.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minuto
  });
  
  const { data: muscleGroups } = trpc.exercises.muscleGroups.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 300000, // 5 minutos - dados estáticos
  });
  
  const utils = trpc.useUtils();
  
  const deleteMutation = trpc.exercises.delete.useMutation({
    onSuccess: () => {
      toast.success('Exercício deletado!');
      utils.exercises.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const filteredExercises = useMemo(() => {
    if (!exercises) return [];
    if (!searchQuery) return exercises;
    
    const query = searchQuery.toLowerCase();
    return exercises.filter(ex => 
      ex.name.toLowerCase().includes(query)
    );
  }, [exercises, searchQuery]);

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

  const muscleGroupMap = new Map(muscleGroups?.map(mg => [mg.id, mg.name]) || []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Exercícios</h1>
            <p className="text-muted-foreground">Biblioteca completa</p>
          </div>
          <Button size="sm" onClick={() => {
            setEditingId(undefined);
            setDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar exercícios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {!exercises || exercises.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Nenhum exercício encontrado.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Exercício
            </Button>
          </Card>
        ) : filteredExercises.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum exercício encontrado para "{searchQuery}"
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="p-4">
                <ExerciseCard
                  name={exercise.name}
                  muscleGroup={exercise.muscleGroupId ? muscleGroupMap.get(exercise.muscleGroupId) : undefined}
                  equipmentType={exercise.equipmentType || undefined}
                />
                {exercise.isCustom === 1 && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(exercise.id);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm('Deseja deletar este exercício?')) {
                          deleteMutation.mutate({ id: exercise.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Deletar
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <ExerciseDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          exerciseId={editingId}
          onSuccess={() => setDialogOpen(false)}
        />
      </div>
    </div>
  );
}
