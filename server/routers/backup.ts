import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const backupRouter = router({
  // Exportar todos os dados do usuário em JSON
  exportData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [exercises, routines, sessions, prs] = await Promise.all([
      db.getUserExercises(userId),
      db.getUserRoutines(userId),
      db.getUserWorkoutSessions(userId),
      db.getUserPRs(userId),
    ]);

    // Obter séries de cada sessão
    const sessionsWithSets = await Promise.all(
      sessions.map(async (session) => {
        const sets = await db.getSessionSets(session.id);
        return { ...session, sets };
      })
    );

    // Obter exercícios de cada rotina
    const routinesWithExercises = await Promise.all(
      routines.map(async (routine) => {
        const routineExercises = await db.getRoutineExercises(routine.id);
        return { ...routine, exercises: routineExercises };
      })
    );

    return {
      exportDate: new Date().toISOString(),
      user: {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
      },
      exercises,
      routines: routinesWithExercises,
      workoutSessions: sessionsWithSets,
      personalRecords: prs,
    };
  }),
});
