import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import WorkoutCard from "@/components/WorkoutCard";
import { useState, useMemo } from "react";
import { Filter } from "lucide-react";

export default function History() {
  const { isAuthenticated } = useAuth();
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: sessions, isLoading } = trpc.workouts.history.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: muscleGroups } = trpc.exercises.muscleGroups.useQuery(undefined, {
    enabled: isAuthenticated,
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

  const filteredSessions = useMemo(() => {
    let filtered = sessions?.filter(s => s.finishedAt) || [];
    
    // Filtro por período
    if (periodFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (periodFilter) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(s => new Date(s.finishedAt!) >= filterDate);
    }
    
    // TODO: Filtro por grupo muscular (requer dados adicionais)
    
    return filtered;
  }, [sessions, periodFilter, muscleGroupFilter]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Histórico</h1>
              <p className="text-muted-foreground">Seus treinos anteriores</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          {showFilters && (
            <Card className="p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Período</label>
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="week">Últimos 7 dias</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
                      <SelectItem value="3months">Últimos 3 meses</SelectItem>
                      <SelectItem value="year">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Grupo Muscular</label>
                  <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {muscleGroups?.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {(periodFilter !== "all" || muscleGroupFilter !== "all") && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-3 w-full"
                  onClick={() => {
                    setPeriodFilter("all");
                    setMuscleGroupFilter("all");
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </Card>
          )}
        </div>

        {filteredSessions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum treino finalizado ainda.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              {filteredSessions.length} treino(s) encontrado(s)
            </p>
            {filteredSessions.map((session) => (
              <WorkoutCard
                key={session.id}
                name={session.name}
                date={new Date(session.finishedAt!)}
                totalVolume={session.totalVolume || 0}
                totalSets={session.totalSets || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
