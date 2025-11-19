import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Copy, Pencil, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Routines() {
  const { isAuthenticated } = useAuth();
  const { data: routines, isLoading } = trpc.routines.list.useQuery(undefined, {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Rotinas</h1>
            <p className="text-muted-foreground">Gerencie seus treinos</p>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova
          </Button>
        </div>

        {!routines || routines.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem rotinas de treino.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Rotina
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {routines.map((routine) => (
              <Card key={routine.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{routine.name}</h3>
                    {routine.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {routine.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button size="sm" variant="ghost">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
