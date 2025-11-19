import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { goals } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const goalsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(goals).where(eq(goals.userId, ctx.user.id));
  }),

  create: protectedProcedure
    .input(
      z.object({
        exerciseId: z.number().optional(),
        type: z.enum(["weight", "reps", "volume", "frequency"]),
        targetValue: z.number().min(1),
        deadline: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return db.insert(goals).values({
        userId: ctx.user.id,
        exerciseId: input.exerciseId,
        type: input.type,
        targetValue: input.targetValue,
        deadline: input.deadline,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        targetValue: z.number().optional(),
        currentValue: z.number().optional(),
        deadline: z.date().optional(),
        achieved: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      
      const updateData: any = { ...data };
      if (data.achieved === 1) {
        updateData.achievedAt = new Date();
      }
      
      return db.update(goals).set(data).where(eq(goals.id, id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return db.delete(goals).where(eq(goals.id, input.id));
    }),

  progress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { total: 0, achieved: 0, inProgress: 0 };
    
    const allGoals = await db.select().from(goals).where(eq(goals.userId, ctx.user.id));
    
    return {
      total: allGoals.length,
      achieved: allGoals.filter(g => g.achieved === 1).length,
      inProgress: allGoals.filter(g => g.achieved === 0).length,
    };
  }),
});
