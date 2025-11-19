import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Grupos musculares para categorizar exercícios
 */
export const muscleGroups = mysqlTable("muscle_groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MuscleGroup = typeof muscleGroups.$inferSelect;
export type InsertMuscleGroup = typeof muscleGroups.$inferInsert;

/**
 * Exercícios - biblioteca de exercícios do usuário
 */
export const exercises = mysqlTable("exercises", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  muscleGroupId: int("muscleGroupId").references(() => muscleGroups.id),
  equipmentType: mysqlEnum("equipmentType", ["barbell", "dumbbell", "machine", "cable", "bodyweight", "other"]),
  notes: text("notes"),
  isCustom: int("isCustom").default(0).notNull(), // 0 = pré-definido, 1 = personalizado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;

/**
 * Rotinas de treino
 */
export const routines = mysqlTable("routines", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Routine = typeof routines.$inferSelect;
export type InsertRoutine = typeof routines.$inferInsert;

/**
 * Exercícios dentro de uma rotina (com ordem)
 */
export const routineExercises = mysqlTable("routine_exercises", {
  id: int("id").autoincrement().primaryKey(),
  routineId: int("routineId").notNull().references(() => routines.id, { onDelete: "cascade" }),
  exerciseId: int("exerciseId").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  orderIndex: int("orderIndex").notNull().default(0),
  targetSets: int("targetSets").default(3),
  targetReps: int("targetReps").default(10),
  restSeconds: int("restSeconds").default(90),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RoutineExercise = typeof routineExercises.$inferSelect;
export type InsertRoutineExercise = typeof routineExercises.$inferInsert;

/**
 * Sessões de treino (histórico de treinos realizados)
 */
export const workoutSessions = mysqlTable("workout_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  routineId: int("routineId").references(() => routines.id),
  name: varchar("name", { length: 200 }).notNull(),
  startedAt: timestamp("startedAt").notNull(),
  finishedAt: timestamp("finishedAt"),
  totalVolume: int("totalVolume").default(0), // em kg
  totalSets: int("totalSets").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = typeof workoutSessions.$inferInsert;

/**
 * Séries individuais registradas durante o treino
 */
export const sets = mysqlTable("sets", {
  id: int("id").autoincrement().primaryKey(),
  workoutSessionId: int("workoutSessionId").notNull().references(() => workoutSessions.id, { onDelete: "cascade" }),
  exerciseId: int("exerciseId").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  setNumber: int("setNumber").notNull(),
  weight: int("weight").notNull(), // em kg
  reps: int("reps").notNull(),
  rpe: int("rpe"), // Rate of Perceived Exertion (1-10)
  isFailure: int("isFailure").default(0).notNull(), // 0 = não, 1 = sim
  restSeconds: int("restSeconds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Set = typeof sets.$inferSelect;
export type InsertSet = typeof sets.$inferInsert;

/**
 * Recordes pessoais (PRs) - calculados automaticamente
 */
export const personalRecords = mysqlTable("personal_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: int("exerciseId").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  recordType: mysqlEnum("recordType", ["max_weight", "max_reps", "max_volume"]).notNull(),
  value: int("value").notNull(),
  setId: int("setId").references(() => sets.id, { onDelete: "set null" }),
  achievedAt: timestamp("achievedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PersonalRecord = typeof personalRecords.$inferSelect;
export type InsertPersonalRecord = typeof personalRecords.$inferInsert;