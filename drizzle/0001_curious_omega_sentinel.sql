CREATE TABLE `exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`muscleGroupId` int,
	`equipmentType` enum('barbell','dumbbell','machine','cable','bodyweight','other'),
	`notes` text,
	`isCustom` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `muscle_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `muscle_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`recordType` enum('max_weight','max_reps','max_volume') NOT NULL,
	`value` int NOT NULL,
	`setId` int,
	`achievedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `personal_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routine_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`routineId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`targetSets` int DEFAULT 3,
	`targetReps` int DEFAULT 10,
	`restSeconds` int DEFAULT 90,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `routine_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `routines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workoutSessionId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`setNumber` int NOT NULL,
	`weight` int NOT NULL,
	`reps` int NOT NULL,
	`rpe` int,
	`isFailure` int NOT NULL DEFAULT 0,
	`restSeconds` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`routineId` int,
	`name` varchar(200) NOT NULL,
	`startedAt` timestamp NOT NULL,
	`finishedAt` timestamp,
	`totalVolume` int DEFAULT 0,
	`totalSets` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workout_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `exercises` ADD CONSTRAINT `exercises_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exercises` ADD CONSTRAINT `exercises_muscleGroupId_muscle_groups_id_fk` FOREIGN KEY (`muscleGroupId`) REFERENCES `muscle_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personal_records` ADD CONSTRAINT `personal_records_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personal_records` ADD CONSTRAINT `personal_records_exerciseId_exercises_id_fk` FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personal_records` ADD CONSTRAINT `personal_records_setId_sets_id_fk` FOREIGN KEY (`setId`) REFERENCES `sets`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `routine_exercises` ADD CONSTRAINT `routine_exercises_routineId_routines_id_fk` FOREIGN KEY (`routineId`) REFERENCES `routines`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `routine_exercises` ADD CONSTRAINT `routine_exercises_exerciseId_exercises_id_fk` FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `routines` ADD CONSTRAINT `routines_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sets` ADD CONSTRAINT `sets_workoutSessionId_workout_sessions_id_fk` FOREIGN KEY (`workoutSessionId`) REFERENCES `workout_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sets` ADD CONSTRAINT `sets_exerciseId_exercises_id_fk` FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workout_sessions` ADD CONSTRAINT `workout_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workout_sessions` ADD CONSTRAINT `workout_sessions_routineId_routines_id_fk` FOREIGN KEY (`routineId`) REFERENCES `routines`(`id`) ON DELETE no action ON UPDATE no action;