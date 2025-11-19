import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Calendar, Dumbbell, Award, Target, History as HistoryIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.stats.profile.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const utils = trpc.useUtils();

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Perfil</h1>
          <p className="text-muted-foreground">{user?.name || user?.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.daysActive || 0}</p>
                <p className="text-sm text-muted-foreground">Dias Ativos</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalWorkouts || 0}</p>
                <p className="text-sm text-muted-foreground">Treinos</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.totalVolume ? `${Math.round(stats.totalVolume / 1000)}k` : '0'}
                </p>
                <p className="text-sm text-muted-foreground">Volume (kg)</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalSets || 0}</p>
                <p className="text-sm text-muted-foreground">Séries</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-3">Informações da Conta</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome</span>
              <span className="font-medium">{user?.name || 'Não informado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email || 'Não informado'}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setLocation("/history")}
          >
            <HistoryIcon className="w-5 h-5 mr-3" />
            Ver Histórico
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setLocation("/goals")}
          >
            <Target className="w-5 h-5 mr-3" />
            Minhas Metas
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={async () => {
              const data = await utils.backup.exportData.fetch();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ironlog-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Exportar Dados (JSON)
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => logout()}
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
