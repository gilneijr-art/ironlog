import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const routinesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserRoutines(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getRoutineById(input.id);
    }),

  getExercises: protectedProcedure
    .input(z.object({ routineId: z.number() }))
    .query(async ({ input }) => {
      return db.getRoutineExercises(input.routineId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.createRoutine({
        ...input,
        userId: ctx.user.id,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateRoutine(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deleteRoutine(input.id);
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const routine = await db.getRoutineById(input.id);
      if (!routine) throw new Error("Routine not found");
      
      const result = await db.createRoutine({
        userId: ctx.user.id,
        name: `${routine.name} (Cópia)`,
        description: routine.description,
      });
      
      const newRoutineId = Number(result[0].insertId);
      
      const exercises = await db.getRoutineExercises(input.id);
      for (const ex of exercises) {
        await db.addExerciseToRoutine({
          routineId: newRoutineId,
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          restSeconds: ex.restSeconds,
        });
      }
      
      return { id: newRoutineId };
    }),

  addExercise: protectedProcedure
    .input(
      z.object({
        routineId: z.number(),
        exerciseId: z.number(),
        orderIndex: z.number(),
        targetSets: z.number().default(3),
        targetReps: z.number().default(10),
        restSeconds: z.number().default(90),
      })
    )
    .mutation(async ({ input }) => {
      return db.addExerciseToRoutine(input);
    }),

  removeExercise: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.removeExerciseFromRoutine(input.id);
    }),
});
