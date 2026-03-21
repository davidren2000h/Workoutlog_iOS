import Dexie, { type Table } from 'dexie';
import type {
  Session,
  Activity,
  StrengthSet,
  CardioEntry,
  SkillEntry,
  ExerciseReference,
  WorkoutTemplate,
  UserProfile,
} from '../types';

class WorkoutDB extends Dexie {
  sessions!: Table<Session, number>;
  activities!: Table<Activity, number>;
  strengthSets!: Table<StrengthSet, number>;
  cardioEntries!: Table<CardioEntry, number>;
  skillEntries!: Table<SkillEntry, number>;
  exercises!: Table<ExerciseReference, number>;
  templates!: Table<WorkoutTemplate, number>;
  userProfiles!: Table<UserProfile, number>;

  constructor() {
    super('WorkoutLogDB');

    this.version(1).stores({
      sessions: '++id, date, startTime, templateId',
      activities: '++id, sessionId, type, title',
      strengthSets: '++id, activityId, setIndex',
      cardioEntries: '++id, activityId',
      skillEntries: '++id, activityId',
      exercises: '++id, name, bodyPart, equipment, isCustom',
      templates: '++id, name',
    });

    this.version(2).stores({
      sessions: '++id, date, startTime, templateId',
      activities: '++id, sessionId, type, title',
      strengthSets: '++id, activityId, setIndex',
      cardioEntries: '++id, activityId',
      skillEntries: '++id, activityId',
      exercises: '++id, name, bodyPart, equipment, isCustom',
      templates: '++id, name',
      userProfiles: '++id, name',
    });
  }
}

export const db = new WorkoutDB();

/* ── Seed default exercises on first load ── */
const DEFAULT_EXERCISES: Omit<ExerciseReference, 'id'>[] = [
  // ── Chest / 胸部 ──
  { name: 'Barbell Bench Press', bodyPart: 'Chest', equipment: 'Barbell', isCustom: false },
  { name: 'Cable Fly', bodyPart: 'Chest', equipment: 'Cable', isCustom: false },
  { name: 'Chest Press Machine', bodyPart: 'Chest', equipment: 'Machine', isCustom: false },
  { name: 'Hammer Strength Decline Chest Press', bodyPart: 'Chest', equipment: 'Machine', isCustom: false },
  { name: 'Incline Cable Fly', bodyPart: 'Chest', equipment: 'Cable', isCustom: false },
  { name: 'Decline Cable Fly', bodyPart: 'Chest', equipment: 'Cable', isCustom: false },
  { name: 'Assisted Dips', bodyPart: 'Chest', equipment: 'Machine', isCustom: false },
  { name: 'Hammer Strength Incline Chest Press', bodyPart: 'Chest', equipment: 'Machine', isCustom: false },

  // ── Back / 背部 ──
  { name: 'Barbell Deadlift', bodyPart: 'Back', equipment: 'Barbell', isCustom: false },
  { name: 'Barbell Row', bodyPart: 'Back', equipment: 'Barbell', isCustom: false },
  { name: 'Pull-Up', bodyPart: 'Back', equipment: 'Bodyweight', isCustom: false },
  { name: 'Lat Pulldown', bodyPart: 'Back', equipment: 'Cable', isCustom: false },
  { name: 'Wide-Grip Pull-Up', bodyPart: 'Back', equipment: 'Bodyweight', isCustom: false },
  { name: 'Assisted Wide-Grip Pull-Up', bodyPart: 'Back', equipment: 'Machine', isCustom: false },
  { name: 'Weighted Wide-Grip Pull-Up', bodyPart: 'Back', equipment: 'Bodyweight', isCustom: false },
  { name: 'Neutral-Grip Pull-Up', bodyPart: 'Back', equipment: 'Bodyweight', isCustom: false },
  { name: 'Assisted Neutral-Grip Pull-Up', bodyPart: 'Back', equipment: 'Machine', isCustom: false },
  { name: 'Weighted Neutral-Grip Pull-Up', bodyPart: 'Back', equipment: 'Bodyweight', isCustom: false },
  { name: 'Seated Row Machine', bodyPart: 'Back', equipment: 'Machine', isCustom: false },
  { name: 'Wide-Grip Lat Pulldown', bodyPart: 'Back', equipment: 'Cable', isCustom: false },
  { name: 'Close-Grip Lat Pulldown', bodyPart: 'Back', equipment: 'Cable', isCustom: false },
  { name: 'V-Bar Lat Pulldown', bodyPart: 'Back', equipment: 'Cable', isCustom: false },
  { name: 'Bent-Over Barbell Row', bodyPart: 'Back', equipment: 'Barbell', isCustom: false },

  // ── Shoulders / 肩部 ──
  { name: 'Overhead Press', bodyPart: 'Shoulders', equipment: 'Barbell', isCustom: false },
  { name: 'Dumbbell Lateral Raise', bodyPart: 'Shoulders', equipment: 'Dumbbell', isCustom: false },
  { name: 'Lateral Raise', bodyPart: 'Shoulders', equipment: 'Dumbbell', isCustom: false },
  { name: 'Front Raise', bodyPart: 'Shoulders', equipment: 'Dumbbell', isCustom: false },
  { name: 'Seated Barbell Overhead Press', bodyPart: 'Shoulders', equipment: 'Barbell', isCustom: false },
  { name: 'Push Press', bodyPart: 'Shoulders', equipment: 'Barbell', isCustom: false },
  { name: 'Reverse Pec Deck Fly', bodyPart: 'Shoulders', equipment: 'Machine', isCustom: false },
  { name: 'Upright Barbell Row', bodyPart: 'Shoulders', equipment: 'Barbell', isCustom: false },

  // ── Biceps / 二头 ──
  { name: 'Dumbbell Curl', bodyPart: 'Biceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Standing Alternating Dumbbell Curl', bodyPart: 'Biceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Seated Alternating Dumbbell Curl', bodyPart: 'Biceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'EZ-Bar Biceps Curl', bodyPart: 'Biceps', equipment: 'Barbell', isCustom: false },

  // ── Triceps / 三头 ──
  { name: 'Tricep Pushdown', bodyPart: 'Triceps', equipment: 'Cable', isCustom: false },
  { name: 'Cable Triceps Extension', bodyPart: 'Triceps', equipment: 'Cable', isCustom: false },
  { name: 'V-Bar Triceps Pushdown', bodyPart: 'Triceps', equipment: 'Cable', isCustom: false },
  { name: 'Straight Bar Triceps Pushdown', bodyPart: 'Triceps', equipment: 'Cable', isCustom: false },

  // ── Legs / 腿部 ──
  { name: 'Barbell Squat', bodyPart: 'Legs', equipment: 'Barbell', isCustom: false },
  { name: 'Leg Press', bodyPart: 'Legs', equipment: 'Machine', isCustom: false },
  { name: 'Squat', bodyPart: 'Legs', equipment: 'Barbell', isCustom: false },
  { name: 'Deadlift', bodyPart: 'Legs', equipment: 'Barbell', isCustom: false },
  { name: 'Romanian Deadlift', bodyPart: 'Legs', equipment: 'Barbell', isCustom: false },
  { name: 'Bulgarian Split Squat', bodyPart: 'Legs', equipment: 'Dumbbell', isCustom: false },

  // ── Abs / 腹部 ──
  { name: 'Plank', bodyPart: 'Abs', equipment: 'Bodyweight', isCustom: false },
  { name: 'Sit-Up', bodyPart: 'Abs', equipment: 'Bodyweight', isCustom: false },
  { name: 'Ab Crunch Machine', bodyPart: 'Abs', equipment: 'Machine', isCustom: false },

  // ── Cardio / 有氧 ──
  { name: 'Running', bodyPart: 'Cardio', equipment: 'None', isCustom: false },
  { name: 'Cycling', bodyPart: 'Cardio', equipment: 'None', isCustom: false },
  { name: 'Rowing', bodyPart: 'Cardio', equipment: 'Machine', isCustom: false },
  { name: 'Rowing Machine', bodyPart: 'Cardio', equipment: 'Machine', isCustom: false },
  { name: 'Elliptical Trainer', bodyPart: 'Cardio', equipment: 'Machine', isCustom: false },
  { name: 'Indoor Cycling', bodyPart: 'Cardio', equipment: 'Machine', isCustom: false },
];

/**
 * Seed exercises on first load, and add any missing built-in exercises
 * for existing users who already have some data.
 */
export async function seedExercisesIfEmpty() {
  const count = await db.exercises.count();
  if (count === 0) {
    await db.exercises.bulkAdd(DEFAULT_EXERCISES);
    return;
  }
  // For existing users: add any new built-in exercises they don't have yet
  const existing = await db.exercises.toArray();
  const existingNames = new Set(existing.map((e) => e.name));
  const missing = DEFAULT_EXERCISES.filter((e) => !existingNames.has(e.name));
  if (missing.length > 0) {
    await db.exercises.bulkAdd(missing);
  }
}
