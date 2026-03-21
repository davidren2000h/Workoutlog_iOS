import { db } from './database';
import type {
  Session,
  Activity,
  StrengthSet,
  CardioEntry,
  SkillEntry,
  ExerciseReference,
  WorkoutTemplate,
  SessionWithActivities,
  ActivityWithSets,
  DaySummary,
  PersonalRecord,
  UserProfile,
} from '../types';

/* ══════════════════════════════════════
   User Profile
   ══════════════════════════════════════ */

export async function getProfile(): Promise<UserProfile | undefined> {
  return db.userProfiles.toCollection().first();
}

export async function createProfile(name: string): Promise<number> {
  return db.userProfiles.add({ name, createdAt: Date.now() });
}

export async function updateProfile(id: number, changes: Partial<UserProfile>): Promise<void> {
  await db.userProfiles.update(id, changes);
}

/* ══════════════════════════════════════
   Sessions
   ══════════════════════════════════════ */

export async function createSession(date: string, templateId?: number): Promise<number> {
  return db.sessions.add({
    date,
    startTime: Date.now(),
    notes: '',
    templateId,
  });
}

export async function endSession(id: number): Promise<void> {
  const session = await db.sessions.get(id);
  if (!session) return;
  const duration = Math.round((Date.now() - session.startTime) / 1000);
  await db.sessions.update(id, { endTime: Date.now(), duration });
}

export async function updateSession(id: number, changes: Partial<Session>): Promise<void> {
  await db.sessions.update(id, changes);
}

export async function deleteSession(id: number): Promise<void> {
  const activities = await db.activities.where('sessionId').equals(id).toArray();
  for (const a of activities) {
    await deleteActivity(a.id!);
  }
  await db.sessions.delete(id);
}

export async function getSession(id: number): Promise<Session | undefined> {
  return db.sessions.get(id);
}

export async function getSessionsByDate(date: string): Promise<Session[]> {
  return db.sessions.where('date').equals(date).toArray();
}

export async function getSessionFull(id: number): Promise<SessionWithActivities | undefined> {
  const session = await db.sessions.get(id);
  if (!session) return undefined;
  const acts = await db.activities.where('sessionId').equals(id).sortBy('order');
  const activities: ActivityWithSets[] = [];
  for (const a of acts) {
    activities.push(await loadActivitySets(a));
  }
  return { ...session, activities };
}

/* ══════════════════════════════════════
   Activities
   ══════════════════════════════════════ */

export async function addActivity(
  sessionId: number,
  type: Activity['type'],
  title: string,
): Promise<number> {
  const existing = await db.activities.where('sessionId').equals(sessionId).count();
  return db.activities.add({
    sessionId,
    type,
    title,
    order: existing,
    notes: '',
  });
}

export async function updateActivity(id: number, changes: Partial<Activity>): Promise<void> {
  await db.activities.update(id, changes);
}

export async function deleteActivity(id: number): Promise<void> {
  await db.strengthSets.where('activityId').equals(id).delete();
  await db.cardioEntries.where('activityId').equals(id).delete();
  await db.skillEntries.where('activityId').equals(id).delete();
  await db.activities.delete(id);
}

async function loadActivitySets(a: Activity): Promise<ActivityWithSets> {
  const out: ActivityWithSets = { ...a };
  if (a.type === 'Strength') {
    out.strengthSets = await db.strengthSets.where('activityId').equals(a.id!).sortBy('setIndex');
  } else if (a.type === 'Cardio') {
    out.cardioEntry = await db.cardioEntries.where('activityId').equals(a.id!).first();
  } else {
    out.skillEntry = await db.skillEntries.where('activityId').equals(a.id!).first();
  }
  return out;
}

/* ══════════════════════════════════════
   Strength Sets
   ══════════════════════════════════════ */

export async function addSet(activityId: number, defaults?: Partial<StrengthSet>): Promise<number> {
  const existing = await db.strengthSets.where('activityId').equals(activityId).count();
  return db.strengthSets.add({
    activityId,
    setIndex: existing,
    weight: defaults?.weight ?? 0,
    reps: defaults?.reps ?? 0,
    rpe: defaults?.rpe,
    restSeconds: defaults?.restSeconds,
    tempo: defaults?.tempo,
    isCompleted: false,
  });
}

export async function updateSet(id: number, changes: Partial<StrengthSet>): Promise<void> {
  await db.strengthSets.update(id, changes);
}

export async function deleteSet(id: number): Promise<void> {
  await db.strengthSets.delete(id);
}

/* ══════════════════════════════════════
   Cardio Entries
   ══════════════════════════════════════ */

export async function upsertCardio(activityId: number, data: Partial<CardioEntry>): Promise<void> {
  const existing = await db.cardioEntries.where('activityId').equals(activityId).first();
  if (existing) {
    await db.cardioEntries.update(existing.id!, data);
  } else {
    await db.cardioEntries.add({
      activityId,
      duration: data.duration ?? 0,
      ...data,
    });
  }
}

/* ══════════════════════════════════════
   Skill Entries
   ══════════════════════════════════════ */

export async function upsertSkill(activityId: number, data: Partial<SkillEntry>): Promise<void> {
  const existing = await db.skillEntries.where('activityId').equals(activityId).first();
  if (existing) {
    await db.skillEntries.update(existing.id!, data);
  } else {
    await db.skillEntries.add({
      activityId,
      duration: data.duration ?? 0,
      notes: data.notes ?? '',
      tags: data.tags ?? [],
      ...data,
    });
  }
}

/* ══════════════════════════════════════
   Exercises
   ══════════════════════════════════════ */

export async function getAllExercises(): Promise<ExerciseReference[]> {
  return db.exercises.orderBy('name').toArray();
}

export async function addExercise(ex: Omit<ExerciseReference, 'id'>): Promise<number> {
  return db.exercises.add(ex);
}

export async function deleteExercise(id: number): Promise<void> {
  await db.exercises.delete(id);
}

/* ══════════════════════════════════════
   Templates
   ══════════════════════════════════════ */

export async function getAllTemplates(): Promise<WorkoutTemplate[]> {
  return db.templates.toArray();
}

export async function getTemplate(id: number): Promise<WorkoutTemplate | undefined> {
  return db.templates.get(id);
}

export async function saveTemplate(t: WorkoutTemplate): Promise<number> {
  if (t.id) {
    await db.templates.update(t.id, { name: t.name, activities: t.activities });
    return t.id;
  }
  return db.templates.add(t);
}

export async function deleteTemplate(id: number): Promise<void> {
  await db.templates.delete(id);
}

/** Start a session pre-filled from template */
export async function startFromTemplate(templateId: number, date: string): Promise<number> {
  const tpl = await getTemplate(templateId);
  if (!tpl) throw new Error('Template not found');
  const sessionId = await createSession(date, templateId);
  for (const ta of tpl.activities) {
    const actId = await addActivity(sessionId, ta.type, ta.title);
    if (ta.type === 'Strength' && ta.sets) {
      // Try to get smart defaults from last use of the same exercise
      const lastDefaults = await getLastUsedDefaults(ta.title);
      for (let i = 0; i < ta.sets; i++) {
        await addSet(actId, lastDefaults);
      }
    }
  }
  return sessionId;
}

/* ══════════════════════════════════════
   Smart Defaults
   ══════════════════════════════════════ */

export async function getLastUsedDefaults(
  exerciseTitle: string,
): Promise<Partial<StrengthSet> | undefined> {
  // Find the most recent activity with this title
  const acts = await db.activities.where('title').equals(exerciseTitle).toArray();
  if (acts.length === 0) return undefined;

  // Get their session dates to sort
  const withSessions = await Promise.all(
    acts.map(async (a) => ({ a, session: await db.sessions.get(a.sessionId) })),
  );
  withSessions.sort((x, y) => (y.session?.startTime ?? 0) - (x.session?.startTime ?? 0));

  const latest = withSessions[0];
  if (!latest) return undefined;

  const sets = await db.strengthSets
    .where('activityId')
    .equals(latest.a.id!)
    .sortBy('setIndex');
  if (sets.length === 0) return undefined;
  const last = sets[sets.length - 1];
  return { weight: last.weight, reps: last.reps, rpe: last.rpe, restSeconds: last.restSeconds };
}

/* ══════════════════════════════════════
   Calendar / Summaries
   ══════════════════════════════════════ */

export async function getMonthSummaries(year: number, month: number): Promise<DaySummary[]> {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const sessions = await db.sessions
    .where('date')
    .startsWith(prefix)
    .toArray();

  const byDate = new Map<string, { count: number; duration: number }>();
  for (const s of sessions) {
    const entry = byDate.get(s.date) ?? { count: 0, duration: 0 };
    entry.count += 1;
    entry.duration += s.duration ?? 0;
    byDate.set(s.date, entry);
  }

  const result: DaySummary[] = [];
  for (const [date, val] of byDate) {
    result.push({
      date,
      hasWorkout: true,
      totalDuration: val.duration,
      sessionCount: val.count,
    });
  }
  return result;
}

/* ══════════════════════════════════════
   Progress / PRs
   ══════════════════════════════════════ */

export async function getPersonalRecords(exerciseName: string): Promise<PersonalRecord | null> {
  const acts = await db.activities.where('title').equals(exerciseName).toArray();
  if (acts.length === 0) return null;

  let maxWeight = 0;
  let maxWeightReps = 0;
  let maxWeightDate = '';
  let bestRepsAtWeight = { weight: 0, reps: 0 };

  for (const a of acts) {
    const session = await db.sessions.get(a.sessionId);
    const sets = await db.strengthSets.where('activityId').equals(a.id!).toArray();
    for (const s of sets) {
      if (!s.isCompleted) continue;
      if (s.weight > maxWeight) {
        maxWeight = s.weight;
        maxWeightReps = s.reps;
        maxWeightDate = session?.date ?? '';
      }
      if (s.weight === maxWeight && s.reps > maxWeightReps) {
        maxWeightReps = s.reps;
        maxWeightDate = session?.date ?? '';
      }
      if (s.reps > bestRepsAtWeight.reps || (s.reps === bestRepsAtWeight.reps && s.weight > bestRepsAtWeight.weight)) {
        bestRepsAtWeight = { weight: s.weight, reps: s.reps };
      }
    }
  }
  return {
    exerciseName,
    maxWeight,
    maxWeightReps,
    maxRepsAtWeight: bestRepsAtWeight,
    date: maxWeightDate,
  };
}

export async function getWeeklyVolume(
  exerciseName: string,
  weekStart: string,
  weekEnd: string,
): Promise<number> {
  const sessions = await db.sessions
    .where('date')
    .between(weekStart, weekEnd, true, true)
    .toArray();

  let totalVolume = 0;
  for (const s of sessions) {
    const acts = await db.activities
      .where('sessionId')
      .equals(s.id!)
      .filter((a) => a.title === exerciseName)
      .toArray();
    for (const a of acts) {
      const sets = await db.strengthSets.where('activityId').equals(a.id!).toArray();
      for (const set of sets) {
        if (set.isCompleted) {
          totalVolume += set.weight * set.reps;
        }
      }
    }
  }
  return totalVolume;
}

/* ══════════════════════════════════════
   Export
   ══════════════════════════════════════ */

export async function exportJSON(startDate: string, endDate: string): Promise<string> {
  const sessions = await db.sessions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
  const full: SessionWithActivities[] = [];
  for (const s of sessions) {
    const f = await getSessionFull(s.id!);
    if (f) full.push(f);
  }
  return JSON.stringify(full, null, 2);
}

export async function exportCSV(startDate: string, endDate: string): Promise<string> {
  const sessions = await db.sessions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();

  const rows: string[] = ['Date,Exercise,Type,Set,Weight,Reps,RPE,Rest,Tempo,Completed,Duration,Distance,Notes'];
  for (const s of sessions) {
    const acts = await db.activities.where('sessionId').equals(s.id!).sortBy('order');
    for (const a of acts) {
      if (a.type === 'Strength') {
        const sets = await db.strengthSets.where('activityId').equals(a.id!).sortBy('setIndex');
        for (const set of sets) {
          rows.push(
            [
              s.date, csvEscape(a.title), a.type, set.setIndex + 1,
              set.weight, set.reps, set.rpe ?? '', set.restSeconds ?? '',
              set.tempo ?? '', set.isCompleted ? 'Y' : 'N', '', '', ''
            ].join(','),
          );
        }
      } else if (a.type === 'Cardio') {
        const c = await db.cardioEntries.where('activityId').equals(a.id!).first();
        rows.push(
          [
            s.date, csvEscape(a.title), a.type, '', '', '', c?.rpe ?? '', '',
            '', '', c?.duration ?? '', c?.distance ?? '', ''
          ].join(','),
        );
      } else {
        const sk = await db.skillEntries.where('activityId').equals(a.id!).first();
        rows.push(
          [
            s.date, csvEscape(a.title), a.type, '', '', '', sk?.rpe ?? '', '',
            '', '', sk?.duration ?? '', '', csvEscape(sk?.notes ?? '')
          ].join(','),
        );
      }
    }
  }
  return rows.join('\n');
}

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

/* ══════════════════════════════════════
   Share Stats
   ══════════════════════════════════════ */

export interface ShareStats {
  startDate: string;
  endDate: string;
  sessionCount: number;
  totalDuration: number;  // seconds
  totalVolume: number;    // kg
  activeDays: number;
  exerciseNames: string[];
  topExercises: { name: string; count: number }[];
}

export async function getShareStats(startDate: string, endDate: string): Promise<ShareStats> {
  const sessions = await db.sessions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();

  const activeDays = new Set(sessions.map((s) => s.date)).size;
  let totalDuration = 0;
  let totalVolume = 0;
  const exerciseCount = new Map<string, number>();
  const exerciseSet = new Set<string>();

  for (const s of sessions) {
    totalDuration += s.duration ?? 0;
    const acts = await db.activities.where('sessionId').equals(s.id!).toArray();
    for (const a of acts) {
      exerciseSet.add(a.title);
      exerciseCount.set(a.title, (exerciseCount.get(a.title) ?? 0) + 1);
      if (a.type === 'Strength') {
        const sets = await db.strengthSets.where('activityId').equals(a.id!).toArray();
        for (const set of sets) {
          if (set.isCompleted) {
            totalVolume += set.weight * set.reps;
          }
        }
      }
    }
  }

  const topExercises = [...exerciseCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    startDate,
    endDate,
    sessionCount: sessions.length,
    totalDuration,
    totalVolume,
    activeDays,
    exerciseNames: [...exerciseSet],
    topExercises,
  };
}

/* ══════════════════════════════════════
   Delete All Data
   ══════════════════════════════════════ */

export async function deleteAllData(): Promise<void> {
  await db.strengthSets.clear();
  await db.cardioEntries.clear();
  await db.skillEntries.clear();
  await db.activities.clear();
  await db.sessions.clear();
  await db.templates.clear();
  await db.exercises.clear();
  // Note: does NOT delete user profile — account persists
}
