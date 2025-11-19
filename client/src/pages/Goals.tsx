import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Trophy, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Goals() {
  const { isAuthenticated } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [goalType, setGoalType] = useState<string>("weight");
  const [exerciseId, setExerciseId] = useState<string>("");
  const [targetValue, setTargetValue] = useState("");

  const { data: goals, isLoading } = trpc.goals.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: progress } = trpc.goals.progress.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: exercises } = trpc.exercises.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();

  const createMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      toast.success("Meta criada!");
      utils.goals.list.invalidate();
      utils.goals.progress.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.goals.delete.useMutation({
    onSuccess: () => {
      toast.success("Meta deletada!");
      utils.goals.list.invalidate();
      utils.goals.progress.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setGoalType("weight");
    setExerciseId("");
    setTargetValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetValue || parseInt(targetValue) <= 0) {
      toast.error("Valor da meta inválido");
      return;
    }

    createMutation.mutate({
      type: goalType as "weight" | "reps" | "volume" | "frequency",
      exerciseId: exerciseId ? parseInt(exerciseId) : undefined,
      targetValue: parseInt(targetValue),
    });
  };

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const getGoalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      weight: "Peso",
      reps: "Repetições",
      volume: "Volume",
      frequency: "Frequência",
    };
    return labels[type] || type;
  };

  const getExerciseName = (id: number) => {
    return exercises?.find(e => e.id === id)?.name || "Geral";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Metas</h1>
            <p className="text-muted-foreground">Defina e acompanhe seus objetivos</p>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        {progress && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Progresso Geral</h3>
                <p className="text-sm text-muted-foreground">
                  {progress.achieved} de {progress.total} metas atingidas
                </p>
              </div>
            </div>
            <Progress 
              value={progress.total > 0 ? (progress.achieved / progress.total) * 100 : 0} 
              className="h-3"
            />
          </Card>
        )}

        {!goals || goals.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Você ainda não tem metas definidas.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Meta
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const progressPercent = goal.targetValue > 0 
                ? Math.min((goal.currentValue || 0) / goal.targetValue * 100, 100)
                : 0;

              return (
                <Card key={goal.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {goal.achieved === 1 ? (
                          <Trophy className="w-5 h-5 text-primary" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-muted-foreground" />
                        )}
                        <h3 className="font-semibold text-foreground">
                          {getGoalTypeLabel(goal.type)}
                          {goal.exerciseId && ` - ${getExerciseName(goal.exerciseId)}`}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Meta: {goal.targetValue} | Atual: {goal.currentValue || 0}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (window.confirm("Deseja deletar esta meta?")) {
                          deleteMutation.mutate({ id: goal.id });
                        }
                      }}
                    >
                      ×
                    </Button>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  {goal.achieved === 1 && goal.achievedAt && (
                    <p className="text-xs text-primary mt-2">
                      ✓ Atingida em {new Date(goal.achievedAt).toLocaleDateString()}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Meta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo de Meta</Label>
                  <Select value={goalType} onValueChange={setGoalType}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="weight">Peso Máximo</SelectItem>
                      <SelectItem value="reps">Repetições Máximas</SelectItem>
                      <SelectItem value="volume">Volume Semanal</SelectItem>
                      <SelectItem value="frequency">Frequência Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(goalType === "weight" || goalType === "reps") && (
                  <div className="grid gap-2">
                    <Label htmlFor="exercise">Exercício</Label>
                    <Select value={exerciseId} onValueChange={setExerciseId}>
                      <SelectTrigger id="exercise">
                        <SelectValue placeholder="Selecione um exercício" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {exercises?.map((ex) => (
                          <SelectItem key={ex.id} value={ex.id.toString()}>
                            {ex.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="target">Valor da Meta</Label>
                  <Input
                    id="target"
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder={
                      goalType === "weight" ? "Ex: 100 kg" :
                      goalType === "reps" ? "Ex: 15 reps" :
                      goalType === "volume" ? "Ex: 10000 kg" :
                      "Ex: 5 treinos"
                    }
                    min="1"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Criar Meta
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
