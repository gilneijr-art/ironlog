import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const exercisesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserExercises(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        muscleGroupId: z.number().optional(),
        equipmentType: z.enum(["barbell", "dumbbell", "machine", "cable", "bodyweight", "other"]).optional(),
        notes: z.string().optional(),
        isCustom: z.number().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.createExercise({
        ...input,
        userId: ctx.user.id,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        muscleGroupId: z.number().optional(),
        equipmentType: z.enum(["barbell", "dumbbell", "machine", "cable", "bodyweight", "other"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateExercise(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deleteExercise(input.id);
    }),

  muscleGroups: protectedProcedure.query(async () => {
    return db.getAllMuscleGroups();
  }),
});
