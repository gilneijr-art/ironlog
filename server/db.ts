import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== MUSCLE GROUPS ==========
export async function getAllMuscleGroups() {
  const db = await getDb();
  if (!db) return [];
  const { muscleGroups } = await import("../drizzle/schema");
  return db.select().from(muscleGroups);
}

// ========== EXERCISES ==========
export async function getUserExercises(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { exercises } = await import("../drizzle/schema");
  return db.select().from(exercises).where(eq(exercises.userId, userId));
}

export async function createExercise(exercise: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { exercises } = await import("../drizzle/schema");
  const result: any = await db.insert(exercises).values(exercise);
  const insertId = Number(result.insertId);
  const created = await db.select().from(exercises).where(eq(exercises.id, insertId)).limit(1);
  return created[0];
}

export async function updateExercise(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { exercises } = await import("../drizzle/schema");
  await db.update(exercises).set(data).where(eq(exercises.id, id));
}

export async function deleteExercise(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { exercises } = await import("../drizzle/schema");
  await db.delete(exercises).where(eq(exercises.id, id));
}

// ========== ROUTINES ==========
export async function getUserRoutines(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { routines } = await import("../drizzle/schema");
  return db.select().from(routines).where(eq(routines.userId, userId));
}

export async function getRoutineById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { routines } = await import("../drizzle/schema");
  const result = await db.select().from(routines).where(eq(routines.id, id)).limit(1);
  return result[0] || null;
}

export async function createRoutine(routine: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { routines } = await import("../drizzle/schema");
  const result = await db.insert(routines).values(routine);
  return result;
}

export async function updateRoutine(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { routines } = await import("../drizzle/schema");
  await db.update(routines).set(data).where(eq(routines.id, id));
}

export async function deleteRoutine(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { routines } = await import("../drizzle/schema");
  await db.delete(routines).where(eq(routines.id, id));
}

// ========== ROUTINE EXERCISES ==========
export async function getRoutineExercises(routineId: number) {
  const db = await getDb();
  if (!db) return [];
  const { routineExercises } = await import("../drizzle/schema");
  return db.select().from(routineExercises).where(eq(routineExercises.routineId, routineId));
}

export async function addExerciseToRoutine(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { routineExercises } = await import("../drizzle/schema");
  const result = await db.insert(routineExercises).values(data);
  return result;
}

export async function removeExerciseFromRoutine(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { routineExercises } = await import("../drizzle/schema");
  await db.delete(routineExercises).where(eq(routineExercises.id, id));
}

// ========== WORKOUT SESSIONS ==========
export async function getUserWorkoutSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { workoutSessions } = await import("../drizzle/schema");
  return db.select().from(workoutSessions).where(eq(workoutSessions.userId, userId));
}

export async function getActiveWorkoutSession(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const { workoutSessions } = await import("../drizzle/schema");
  const { isNull, and } = await import("drizzle-orm");
  const result = await db.select().from(workoutSessions)
    .where(and(eq(workoutSessions.userId, userId), isNull(workoutSessions.finishedAt)))
    .limit(1);
  return result[0] || null;
}

export async function createWorkoutSession(session: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { workoutSessions } = await import("../drizzle/schema");
  const result = await db.insert(workoutSessions).values(session);
  return result;
}

export async function updateWorkoutSession(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { workoutSessions } = await import("../drizzle/schema");
  await db.update(workoutSessions).set(data).where(eq(workoutSessions.id, id));
}

// ========== SETS ==========
export async function getSessionSets(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  const { sets } = await import("../drizzle/schema");
  return db.select().from(sets).where(eq(sets.workoutSessionId, sessionId));
}

export async function createSet(set: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { sets } = await import("../drizzle/schema");
  const result = await db.insert(sets).values(set);
  return result;
}

export async function updateSet(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { sets } = await import("../drizzle/schema");
  await db.update(sets).set(data).where(eq(sets.id, id));
}

export async function deleteSet(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { sets } = await import("../drizzle/schema");
  await db.delete(sets).where(eq(sets.id, id));
}

// ========== PERSONAL RECORDS ==========
export async function getUserPRs(userId: number, exerciseId?: number) {
  const db = await getDb();
  if (!db) return [];
  const { personalRecords } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  
  if (exerciseId) {
    return db.select().from(personalRecords)
      .where(and(eq(personalRecords.userId, userId), eq(personalRecords.exerciseId, exerciseId)));
  }
  return db.select().from(personalRecords).where(eq(personalRecords.userId, userId));
}

export async function createOrUpdatePR(pr: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { personalRecords } = await import("../drizzle/schema");
  const result = await db.insert(personalRecords).values(pr);
  return result;
}
