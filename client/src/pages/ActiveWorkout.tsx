import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Check, Timer } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import SetRow from "@/components/SetRow";
import { toast } from "sonner";

export default function ActiveWorkout() {
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute("/workout/:id");
  const [, setLocation] = useLocation();
  const [restTimer, setRestTimer] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);

  const workoutId = params?.id ? parseInt(params.id) : undefined;

  const { data: session, isLoading } = trpc.workouts.getActive.useQuery(undefined, {
    enabled: isAuthenticated && !!workoutId,
  });

  const { data: sets, refetch: refetchSets } = trpc.workouts.getSets.useQuery(
    { sessionId: workoutId! },
    { enabled: !!workoutId }
  );

  const addSetMutation = trpc.workouts.addSet.useMutation({
    onSuccess: () => {
      refetchSets();
      toast.success("Série adicionada!");
      // Iniciar timer de descanso
      setRestTimer(90);
      setRestTimerActive(true);
    },
  });

  const finishMutation = trpc.workouts.finish.useMutation({
    onSuccess: () => {
      toast.success("Treino finalizado!");
      setLocation("/");
    },
  });

  // Timer de descanso
  useEffect(() => {
    if (!restTimerActive || restTimer <= 0) {
      setRestTimerActive(false);
      return;
    }

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          setRestTimerActive(false);
          toast.info("Tempo de descanso finalizado!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimerActive, restTimer]);

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Agrupar séries por exercício
  const exerciseGroups = new Map<number, any[]>();
  sets?.forEach((set) => {
    if (!exerciseGroups.has(set.exerciseId)) {
      exerciseGroups.set(set.exerciseId, []);
    }
    exerciseGroups.get(set.exerciseId)!.push(set);
  });

  const handleAddSet = (exerciseId: number, weight: number, reps: number) => {
    const exerciseSets = exerciseGroups.get(exerciseId) || [];
    const setNumber = exerciseSets.length + 1;

    addSetMutation.mutate({
      workoutSessionId: workoutId!,
      exerciseId,
      setNumber,
      weight,
      reps,
    });
  };

  const handleFinish = () => {
    if (window.confirm("Deseja finalizar o treino?")) {
      finishMutation.mutate({ id: workoutId! });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">{session.name}</h1>
          <p className="text-muted-foreground">Treino em andamento</p>
        </div>

        {restTimerActive && (
          <Card className="p-4 mb-6 bg-primary/10 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Descanso</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-6 mb-6">
          {/* Exemplo de exercício - em produção, isso viria da rotina */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4">Supino Reto</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex gap-2 text-sm text-muted-foreground px-2">
                <div className="w-8"></div>
                <div className="flex-1 text-center">Peso (kg)</div>
                <div className="flex-1 text-center">Reps</div>
                <div className="w-20"></div>
              </div>

              {(exerciseGroups.get(1) || []).map((set, idx) => (
                <SetRow
                  key={set.id}
                  setNumber={idx + 1}
                  previousWeight={set.weight}
                  previousReps={set.reps}
                  onSave={(w, r) => handleAddSet(1, w, r)}
                  isCompleted={true}
                />
              ))}

              <SetRow
                setNumber={(exerciseGroups.get(1)?.length || 0) + 1}
                previousWeight={exerciseGroups.get(1)?.[exerciseGroups.get(1)!.length - 1]?.weight}
                previousReps={exerciseGroups.get(1)?.[exerciseGroups.get(1)!.length - 1]?.reps}
                onSave={(w, r) => handleAddSet(1, w, r)}
              />
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                const lastSet = exerciseGroups.get(1)?.[exerciseGroups.get(1)!.length - 1];
                if (lastSet) {
                  handleAddSet(1, lastSet.weight, lastSet.reps);
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Duplicar Última Série
            </Button>
          </Card>
        </div>

        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
          <div className="container max-w-2xl flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setLocation("/")}
            >
              Pausar
            </Button>
            <Button 
              className="flex-1"
              onClick={handleFinish}
            >
              <Check className="w-4 h-4 mr-2" />
              Finalizar Treino
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
