import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import WorkoutCard from "@/components/WorkoutCard";

export default function History() {
  const { isAuthenticated } = useAuth();
  const { data: sessions, isLoading } = trpc.workouts.history.useQuery(undefined, {
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

  const completedSessions = sessions?.filter(s => s.finishedAt) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Histórico</h1>
          <p className="text-muted-foreground">Seus treinos anteriores</p>
        </div>

        {completedSessions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum treino finalizado ainda.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {completedSessions.map((session) => (
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
