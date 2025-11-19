import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const workoutsRouter = router({
  // Obter treino ativo
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return db.getActiveWorkoutSession(ctx.user.id);
  }),

  // Iniciar novo treino
  start: protectedProcedure
    .input(
      z.object({
        routineId: z.number().optional(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.createWorkoutSession({
        userId: ctx.user.id,
        routineId: input.routineId,
        name: input.name,
        startedAt: new Date(),
      });
    }),

  // Finalizar treino
  finish: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.updateWorkoutSession(input.id, {
        finishedAt: new Date(),
      });
    }),

  // Listar histórico de treinos
  history: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserWorkoutSessions(ctx.user.id);
  }),

  // Obter séries de uma sessão
  getSets: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return db.getSessionSets(input.sessionId);
    }),

  // Adicionar série
  addSet: protectedProcedure
    .input(
      z.object({
        workoutSessionId: z.number(),
        exerciseId: z.number(),
        setNumber: z.number(),
        weight: z.number(),
        reps: z.number(),
        rpe: z.number().optional(),
        isFailure: z.number().default(0),
        restSeconds: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.createSet(input);
      
      // Atualizar volume e total de séries da sessão
      const sets = await db.getSessionSets(input.workoutSessionId);
      const totalVolume = sets.reduce((acc, set) => acc + (set.weight * set.reps), 0);
      const totalSets = sets.length;
      
      await db.updateWorkoutSession(input.workoutSessionId, {
        totalVolume,
        totalSets,
      });
      
      // Verificar e atualizar PRs
      await updatePersonalRecords(input.exerciseId, input.workoutSessionId);
      
      return result;
    }),

  // Editar série
  updateSet: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        weight: z.number().optional(),
        reps: z.number().optional(),
        rpe: z.number().optional(),
        isFailure: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateSet(id, data);
    }),

  // Deletar série
  deleteSet: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deleteSet(input.id);
    }),
});

// Função auxiliar para atualizar PRs
async function updatePersonalRecords(exerciseId: number, sessionId: number) {
  const sets = await db.getSessionSets(sessionId);
  const exerciseSets = sets.filter(s => s.exerciseId === exerciseId);
  
  if (exerciseSets.length === 0) return;
  
  // Encontrar max weight
  const maxWeight = Math.max(...exerciseSets.map(s => s.weight));
  const maxWeightSet = exerciseSets.find(s => s.weight === maxWeight);
  
  // Encontrar max reps
  const maxReps = Math.max(...exerciseSets.map(s => s.reps));
  const maxRepsSet = exerciseSets.find(s => s.reps === maxReps);
  
  // Encontrar max volume (weight * reps)
  const volumes = exerciseSets.map(s => ({ set: s, volume: s.weight * s.reps }));
  const maxVolumeEntry = volumes.reduce((max, curr) => curr.volume > max.volume ? curr : max);
  
  // Obter sessão para userId
  const { workoutSessions } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const dbInstance = await db.getDb();
  if (!dbInstance) return;
  
  const sessionResult = await dbInstance.select().from(workoutSessions)
    .where(eq(workoutSessions.id, sessionId))
    .limit(1);
  
  if (sessionResult.length === 0) return;
  const userId = sessionResult[0].userId;
  
  // Criar ou atualizar PRs
  if (maxWeightSet) {
    await db.createOrUpdatePR({
      userId,
      exerciseId,
      recordType: "max_weight",
      value: maxWeight,
      setId: maxWeightSet.id,
      achievedAt: new Date(),
    });
  }
  
  if (maxRepsSet) {
    await db.createOrUpdatePR({
      userId,
      exerciseId,
      recordType: "max_reps",
      value: maxReps,
      setId: maxRepsSet.id,
      achievedAt: new Date(),
    });
  }
  
  await db.createOrUpdatePR({
    userId,
    exerciseId,
    recordType: "max_volume",
    value: maxVolumeEntry.volume,
    setId: maxVolumeEntry.set.id,
    achievedAt: new Date(),
  });
}
