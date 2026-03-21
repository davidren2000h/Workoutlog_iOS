/* ── User Profile ── */
export interface UserProfile {
  id?: number;
  name: string;
  createdAt: number; // epoch ms
}

/* ── Activity type union ── */
export type ActivityType = 'Strength' | 'Cardio' | 'Skill';

/* ── Core Entities ── */

export interface Session {
  id?: number;
  date: string;          // YYYY-MM-DD
  startTime: number;     // epoch ms
  endTime?: number;      // epoch ms
  duration?: number;     // seconds
  notes: string;
  templateId?: number;
}

export interface Activity {
  id?: number;
  sessionId: number;
  type: ActivityType;
  title: string;
  order: number;
  notes: string;
}

export interface StrengthSet {
  id?: number;
  activityId: number;
  setIndex: number;
  weight: number;
  reps: number;
  rpe?: number;
  restSeconds?: number;
  tempo?: string;          // e.g. "3-1-1"
  isCompleted: boolean;
}

export interface CardioEntry {
  id?: number;
  activityId: number;
  duration: number;       // seconds
  distance?: number;      // km
  pace?: string;
  avgHr?: number;
  rpe?: number;
}

export interface SkillEntry {
  id?: number;
  activityId: number;
  duration: number;       // seconds
  rpe?: number;
  notes: string;
  tags: string[];
}

export interface ExerciseReference {
  id?: number;
  name: string;
  bodyPart: string;
  equipment: string;
  isCustom: boolean;
}

export interface WorkoutTemplate {
  id?: number;
  name: string;
  activities: TemplateActivity[];
}

export interface TemplateActivity {
  type: ActivityType;
  title: string;
  order: number;
  sets?: number;         // default number of sets for strength
}

/* ── Aggregated view models ── */

export interface SessionWithActivities extends Session {
  activities: ActivityWithSets[];
}

export interface ActivityWithSets extends Activity {
  strengthSets?: StrengthSet[];
  cardioEntry?: CardioEntry;
  skillEntry?: SkillEntry;
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  maxWeightReps: number;
  maxRepsAtWeight: { weight: number; reps: number };
  date: string;
}

export interface DaySummary {
  date: string;
  hasWorkout: boolean;
  totalDuration: number;  // seconds
  sessionCount: number;
}
