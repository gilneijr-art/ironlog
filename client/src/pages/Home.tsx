import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Plus } from "lucide-react";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: activeWorkout, isLoading } = trpc.workouts.getActive.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">{APP_TITLE}</h1>
          <p className="text-muted-foreground mb-6">
            Registre seus treinos de musculação de forma rápida e intuitiva.
          </p>
          <Button size="lg" className="w-full">
            Fazer Login
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (activeWorkout) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">Treino em Andamento</h1>
            <p className="text-muted-foreground">{activeWorkout.name}</p>
          </div>

          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Continue seu treino ou finalize para ver o resumo.
            </p>
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => setLocation(`/workout/${activeWorkout.id}`)}
            >
              <Play className="w-5 h-5 mr-2" />
              Continuar Treino
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Início</h1>
          <p className="text-muted-foreground">Pronto para treinar?</p>
        </div>

        <Card className="p-6">
          <Button 
            size="lg" 
            className="w-full mb-4"
            onClick={() => setLocation('/routines')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Iniciar Treino
          </Button>
          
          <p className="text-sm text-center text-muted-foreground">
            Selecione uma rotina ou crie um treino personalizado
          </p>
        </Card>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Atalhos Rápidos</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setLocation('/routines')}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">Rotinas</div>
                <p className="text-sm text-muted-foreground">Gerenciar treinos</p>
              </div>
            </Card>
            <Card 
              className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setLocation('/exercises')}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">Exercícios</div>
                <p className="text-sm text-muted-foreground">Biblioteca completa</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
