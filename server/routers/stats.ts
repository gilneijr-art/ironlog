import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const statsRouter = router({
  // Obter PRs do usuário
  personalRecords: protectedProcedure
    .input(z.object({ exerciseId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return db.getUserPRs(ctx.user.id, input.exerciseId);
    }),

  // Estatísticas gerais do perfil
  profile: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await db.getUserWorkoutSessions(ctx.user.id);
    const completedSessions = sessions.filter(s => s.finishedAt !== null);
    
    const totalVolume = completedSessions.reduce((acc, s) => acc + (s.totalVolume || 0), 0);
    const totalSets = completedSessions.reduce((acc, s) => acc + (s.totalSets || 0), 0);
    const totalWorkouts = completedSessions.length;
    
    // Calcular dias treinados (dias únicos)
    const uniqueDates = new Set(
      completedSessions.map(s => 
        s.finishedAt ? new Date(s.finishedAt).toDateString() : ''
      ).filter(Boolean)
    );
    const daysActive = uniqueDates.size;
    
    return {
      totalWorkouts,
      totalVolume,
      totalSets,
      daysActive,
    };
  }),

  // Estatísticas de um exercício específico
  exerciseStats: protectedProcedure
    .input(z.object({ exerciseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const sessions = await db.getUserWorkoutSessions(ctx.user.id);
      const allSets: any[] = [];
      
      for (const session of sessions) {
        const sets = await db.getSessionSets(session.id);
        const exerciseSets = sets.filter(s => s.exerciseId === input.exerciseId);
        allSets.push(...exerciseSets.map(s => ({ ...s, sessionDate: session.finishedAt })));
      }
      
      if (allSets.length === 0) {
        return {
          totalSets: 0,
          totalVolume: 0,
          maxWeight: 0,
          maxReps: 0,
          avgWeight: 0,
          avgReps: 0,
          history: [],
        };
      }
      
      const totalSets = allSets.length;
      const totalVolume = allSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
      const maxWeight = Math.max(...allSets.map(s => s.weight));
      const maxReps = Math.max(...allSets.map(s => s.reps));
      const avgWeight = allSets.reduce((acc, s) => acc + s.weight, 0) / totalSets;
      const avgReps = allSets.reduce((acc, s) => acc + s.reps, 0) / totalSets;
      
      // Agrupar por sessão para histórico
      const sessionMap = new Map();
      allSets.forEach(set => {
        const key = set.workoutSessionId;
        if (!sessionMap.has(key)) {
          sessionMap.set(key, {
            sessionId: key,
            date: set.sessionDate,
            sets: [],
            totalVolume: 0,
            maxWeight: 0,
          });
        }
        const entry = sessionMap.get(key);
        entry.sets.push(set);
        entry.totalVolume += set.weight * set.reps;
        entry.maxWeight = Math.max(entry.maxWeight, set.weight);
      });
      
      const history = Array.from(sessionMap.values())
        .filter(h => h.date)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return {
        totalSets,
        totalVolume,
        maxWeight,
        maxReps,
        avgWeight: Math.round(avgWeight * 10) / 10,
        avgReps: Math.round(avgReps * 10) / 10,
        history,
      };
    }),
});
