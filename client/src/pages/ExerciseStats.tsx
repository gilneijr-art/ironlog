import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Dumbbell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useRoute } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ExerciseStats() {
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute("/exercise/:id");
  const exerciseId = params?.id ? parseInt(params.id) : undefined;

  const { data: stats, isLoading } = trpc.stats.exerciseStats.useQuery(
    { exerciseId: exerciseId! },
    { enabled: isAuthenticated && !!exerciseId }
  );

  const { data: prs } = trpc.stats.personalRecords.useQuery(
    { exerciseId },
    { enabled: isAuthenticated && !!exerciseId }
  );

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const maxWeightPR = prs?.find(pr => pr.recordType === "max_weight");
  const maxRepsPR = prs?.find(pr => pr.recordType === "max_reps");
  const maxVolumePR = prs?.find(pr => pr.recordType === "max_volume");

  // Preparar dados para o gráfico
  const chartData = stats.history.slice(0, 10).reverse().map((h: any) => ({
    date: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: h.maxWeight,
    volume: h.totalVolume,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Estatísticas</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <Award className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{maxWeightPR?.value || 0}</p>
              <p className="text-xs text-muted-foreground">Peso Máx (kg)</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <Dumbbell className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{maxRepsPR?.value || 0}</p>
              <p className="text-xs text-muted-foreground">Reps Máx</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.totalSets}</p>
              <p className="text-xs text-muted-foreground">Total Séries</p>
            </div>
          </Card>
        </div>

        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-4">Progressão de Peso</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0 0)" />
                <XAxis 
                  dataKey="date" 
                  stroke="oklch(0.88 0 0)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="oklch(0.88 0 0)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'oklch(0.10 0 0)', 
                    border: '1px solid oklch(0.35 0 0)',
                    borderRadius: '8px',
                    color: 'oklch(0.98 0 0)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="peso" 
                  stroke="oklch(0.48 0.25 29)" 
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.48 0.25 29)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Sem dados suficientes para gráfico
            </p>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">Médias</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peso Médio</span>
              <span className="font-semibold">{stats.avgWeight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reps Médias</span>
              <span className="font-semibold">{stats.avgReps}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volume Total</span>
              <span className="font-semibold">{stats.totalVolume} kg</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
