import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { SessionWithActivities, ActivityType, StrengthSet, CardioEntry, SkillEntry } from '../types';
import {
  getSessionFull,
  endSession,
  addActivity,
  deleteActivity,
  addSet,
  updateSet,
  deleteSet,
  upsertCardio,
  upsertSkill,
  updateSession,
  getLastUsedDefaults,
} from '../db/operations';
import Timer from '../components/Timer';
import RestTimer from '../components/RestTimer';
import SetRow from '../components/SetRow';
import CardioForm from '../components/CardioForm';
import SkillForm from '../components/SkillForm';
import ExercisePicker from '../components/ExercisePicker';
import { useI18n } from '../i18n';
import { tExercise } from '../utils/exerciseNames';

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const sessionId = parseInt(id!, 10);

  const [session, setSession] = useState<SessionWithActivities | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [restTrigger, setRestTrigger] = useState(0);

  const reload = useCallback(async () => {
    const s = await getSessionFull(sessionId);
    if (s) setSession(s);
  }, [sessionId]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (!session) return <div className="empty-state">{t('session.loading')}</div>;

  const isActive = !session.endTime;

  /* ── Handlers ── */
  const handleFinish = async () => {
    await endSession(sessionId);
    await reload();
  };

  const handleAddExercise = async (type: ActivityType, title: string) => {
    const actId = await addActivity(sessionId, type, title);
    if (type === 'Strength') {
      const defaults = await getLastUsedDefaults(title);
      await addSet(actId, defaults ?? undefined);
    }
    setShowPicker(false);
    await reload();
  };

  const handleDeleteActivity = async (actId: number) => {
    await deleteActivity(actId);
    await reload();
  };

  const handleAddSet = async (actId: number) => {
    // Duplicate last set values
    const act = session.activities.find((a) => a.id === actId);
    const lastSet = act?.strengthSets?.at(-1);
    await addSet(actId, lastSet ? { weight: lastSet.weight, reps: lastSet.reps } : undefined);
    await reload();
  };

  const handleSetChange = async (setId: number, changes: Partial<StrengthSet>) => {
    await updateSet(setId, changes);
    if (changes.isCompleted === true) {
      setRestTrigger((prev) => prev + 1);
    }
    await reload();
  };

  const handleDeleteSet = async (setId: number) => {
    await deleteSet(setId);
    await reload();
  };

  const handleEffortChange = async (actId: number, level: number) => {
    const act = session.activities.find((a) => a.id === actId);
    if (!act?.strengthSets) return;
    for (const s of act.strengthSets) {
      await updateSet(s.id!, { rpe: level });
    }
    await reload();
  };

  const handleCardioSave = async (actId: number, data: Partial<CardioEntry>) => {
    await upsertCardio(actId, data);
    await reload();
  };

  const handleSkillSave = async (actId: number, data: Partial<SkillEntry>) => {
    await upsertSkill(actId, data);
    await reload();
  };

  const handleNotesChange = async (notes: string) => {
    await updateSession(sessionId, { notes });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex-between mb-16">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
          {t('session.back')}
        </button>
        {isActive && (
          <button className="btn btn-success btn-sm" onClick={handleFinish}>
            {t('session.finish')}
          </button>
        )}
      </div>

      {/* Timer */}
      {isActive && <Timer running={true} startTime={session.startTime} />}
      {!isActive && session.duration !== undefined && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 16 }}>
          {t('session.completedMin')} · {Math.round(session.duration / 60)} {t('session.min')}
        </div>
      )}

      {/* Activities */}
      {session.activities.map((act) => (
        <div key={act.id} className="card">
          <div className="card-header">
            <div>
              <span className="card-title">{tExercise(act.title, lang)}</span>
              <span className={`badge badge-${act.type.toLowerCase()}`} style={{ marginLeft: 8 }}>
                {t(`type.${act.type}` as const)}
              </span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handleDeleteActivity(act.id!)}
              style={{ color: 'var(--danger)' }}
            >
              ✕
            </button>
          </div>

          {act.type === 'Strength' && (
            <>
              {/* Column headers */}
              <div className="set-row" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                <span className="set-index">#</span>
                <span style={{ width: 70, textAlign: 'center' }}>{t('session.weight')}</span>
                <span style={{ width: 70, textAlign: 'center' }}>{t('session.reps')}</span>
                <span style={{ width: 28 }}></span>
                <span style={{ width: 28 }}></span>
              </div>
              {act.strengthSets?.map((s, i) => (
                <SetRow
                  key={s.id}
                  set={s}
                  index={i}
                  onChange={handleSetChange}
                  onDelete={handleDeleteSet}
                />
              ))}
              {/* Effort level selector */}
              <div className="effort-selector mt-8">
                <span className="effort-label">{t('session.effort')}</span>
                {([1, 2, 3] as const).map((level) => {
                  const effortKey = level === 1 ? 'session.effortEasy' : level === 2 ? 'session.effortMedium' : 'session.effortHard';
                  const currentRpe = act.strengthSets?.[0]?.rpe;
                  return (
                    <button
                      key={level}
                      className={`effort-btn effort-btn-${level} ${currentRpe === level ? 'effort-active' : ''}`}
                      onClick={() => handleEffortChange(act.id!, level)}
                    >
                      {t(effortKey as any)}
                    </button>
                  );
                })}
              </div>
              {isActive && (
                <button className="btn btn-ghost btn-sm mt-8" onClick={() => handleAddSet(act.id!)}>
                  {t('session.addSet')}
                </button>
              )}
            </>
          )}

          {act.type === 'Cardio' && (
            <CardioForm entry={act.cardioEntry} activityId={act.id!} onSave={handleCardioSave} />
          )}

          {act.type === 'Skill' && (
            <SkillForm entry={act.skillEntry} activityId={act.id!} onSave={handleSkillSave} />
          )}
        </div>
      ))}

      {/* Add Exercise */}
      {isActive && (
        <button className="btn btn-primary btn-block mt-8" onClick={() => setShowPicker(true)}>
          {t('session.addExercise')}
        </button>
      )}

      {/* Notes */}
      <div className="card mt-16">
        <div className="input-group">
          <label>{t('session.notes')}</label>
          <textarea
            className="input"
            rows={3}
            placeholder={t('session.notesPlaceholder')}
            defaultValue={session.notes}
            onBlur={(e) => handleNotesChange(e.target.value)}
          />
        </div>
      </div>

      {/* Rest Timer */}
      {isActive && <RestTimer trigger={restTrigger} visible={true} />}

      {showPicker && (
        <ExercisePicker onSelect={handleAddExercise} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}
