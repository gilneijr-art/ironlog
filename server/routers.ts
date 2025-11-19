import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  exercises: async () => {
    const { exercisesRouter } = await import("./routers/exercises");
    return exercisesRouter;
  },
  
  routines: async () => {
    const { routinesRouter } = await import("./routers/routines");
    return routinesRouter;
  },
  
  workouts: async () => {
    const { workoutsRouter } = await import("./routers/workouts");
    return workoutsRouter;
  },
  
  stats: async () => {
    const { statsRouter } = await import("./routers/stats");
    return statsRouter;
  },
  
  backup: async () => {
    const { backupRouter } = await import("./routers/backup");
    return backupRouter;
  },
});

export type AppRouter = typeof appRouter;
