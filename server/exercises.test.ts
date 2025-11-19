import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("exercises router", () => {
  it("should have exercises router defined", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    expect(caller.exercises).toBeDefined();
    expect(typeof caller.exercises).toBe('function');
  });

  it("should have auth router working", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const me = await caller.auth.me();
    expect(me).toBeDefined();
    expect(me?.id).toBe(1);
  });
});
