import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState, useMemo } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import { Card } from "@/components/ui/card";

export default function Exercises() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: exercises, isLoading } = trpc.exercises.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: muscleGroups } = trpc.exercises.muscleGroups.useQuery(undefined, {
    enabled: isAuthenticated,
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
          <Button size="sm">
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
              <ExerciseCard
                key={exercise.id}
                name={exercise.name}
                muscleGroup={exercise.muscleGroupId ? muscleGroupMap.get(exercise.muscleGroupId) : undefined}
                equipmentType={exercise.equipmentType || undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
