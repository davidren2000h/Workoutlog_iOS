import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { todayStr, formatDuration } from '../utils';
import {
  getSessionsByDate,
  createSession,
  deleteSession,
  getSessionFull,
  getAllTemplates,
  startFromTemplate,
} from '../db/operations';
import type { Session, WorkoutTemplate, SessionWithActivities } from '../types';
import { useI18n } from '../i18n';
import { tExercise } from '../utils/exerciseNames';

export default function TodayPage() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const today = todayStr();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [details, setDetails] = useState<Map<number, SessionWithActivities>>(new Map());
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await getSessionsByDate(today);
    setSessions(s);
    const d = new Map<number, SessionWithActivities>();
    for (const sess of s) {
      const full = await getSessionFull(sess.id!);
      if (full) d.set(sess.id!, full);
    }
    setDetails(d);
    setTemplates(await getAllTemplates());
  };

  const handleNewBlank = async () => {
    const id = await createSession(today);
    navigate(`/session/${id}`);
  };

  const handleFromTemplate = async (tplId: number) => {
    const id = await startFromTemplate(tplId, today);
    setShowTemplates(false);
    navigate(`/session/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('today.confirmDelete'))) return;
    await deleteSession(id);
    await loadData();
  };

  const activeSessions = sessions.filter((s) => !s.endTime);
  const completedSessions = sessions.filter((s) => !!s.endTime);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{t('today.title')}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        {new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      {/* Active workouts */}
      {activeSessions.map((s) => {
        const full = details.get(s.id!);
        return (
          <div key={s.id} className="card" onClick={() => navigate(`/session/${s.id}`)} style={{ cursor: 'pointer' }}>
            <div className="flex-between">
              <span className="card-title" style={{ color: 'var(--success)' }}>
                {t('today.inProgress')}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {full?.activities.length ?? 0} {t('today.exercises')}
              </span>
            </div>
            {full?.activities.map((a) => (
              <div key={a.id} style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {tExercise(a.title, lang)}{' '}
                {a.type === 'Strength' && a.strengthSets
                  ? `· ${a.strengthSets.filter((s) => s.isCompleted).length}/${a.strengthSets.length} ${t('today.sets')}`
                  : ''}
              </div>
            ))}
          </div>
        );
      })}

      {/* Completed */}
      {completedSessions.length > 0 && (
        <p className="section-title">{t('today.completed')}</p>
      )}
      {completedSessions.map((s) => {
        const full = details.get(s.id!);
        return (
          <div key={s.id} className="card" style={{ cursor: 'pointer' }}>
            <div className="flex-between" onClick={() => navigate(`/session/${s.id}`)}>
              <span className="card-title">
                {full?.activities.map((a) => tExercise(a.title, lang)).join(', ') || t('today.workout')}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {s.duration ? formatDuration(s.duration) : ''}
              </span>
            </div>
            <div className="flex-between mt-8">
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {full?.activities.length ?? 0} {t('today.exercises')}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--danger)', fontSize: 11 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(s.id!);
                }}
              >
                {t('today.delete')}
              </button>
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {sessions.length === 0 && (
        <div className="empty-state">
          <h3>{t('today.emptyTitle')}</h3>
          <p>{t('today.emptyDesc')}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="btn btn-primary btn-block" onClick={handleNewBlank}>
          {t('today.startBlank')}
        </button>
        {templates.length > 0 && (
          <button className="btn btn-ghost btn-block" onClick={() => setShowTemplates(!showTemplates)}>
            {t('today.startTemplate')}
          </button>
        )}
      </div>

      {showTemplates && (
        <div className="card mt-8">
          <p className="section-title" style={{ marginTop: 0 }}>{t('today.templates')}</p>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              className="btn btn-ghost btn-block"
              style={{ justifyContent: 'flex-start', marginBottom: 4 }}
              onClick={() => handleFromTemplate(tpl.id!)}
            >
              {tpl.name}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
                {tpl.activities.length} {t('today.exercises')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
