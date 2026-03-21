import { useState, useEffect } from 'react';
import { getAllExercises, getPersonalRecords, getWeeklyVolume } from '../db/operations';
import type { ExerciseReference, PersonalRecord } from '../types';
import { useI18n } from '../i18n';
import { tExercise } from '../utils/exerciseNames';

export default function ProgressPage() {
  const { t, lang } = useI18n();
  const [exercises, setExercises] = useState<ExerciseReference[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [pr, setPr] = useState<PersonalRecord | null>(null);
  const [weekVol, setWeekVol] = useState<number>(0);

  useEffect(() => {
    getAllExercises().then((exs) => {
      setExercises(exs);
      if (exs.length > 0) setSelected(exs[0].name);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    getPersonalRecords(selected).then(setPr);
    // Current week volume
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    getWeeklyVolume(selected, fmt(monday), fmt(sunday)).then(setWeekVol);
  }, [selected]);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{t('progress.title')}</h1>

      <div className="input-group">
        <label>{t('progress.exercise')}</label>
        <select className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.name}>
              {tExercise(ex.name, lang)}
            </option>
          ))}
        </select>
      </div>

      {pr ? (
        <div className="card">
          <p className="card-title mb-8">{t('progress.pr')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Stat label={t('progress.maxWeight')} value={`${pr.maxWeight} kg`} />
            <Stat label={t('progress.repsAtMax')} value={`${pr.maxWeightReps}`} />
            <Stat label={t('progress.bestReps')} value={`${pr.maxRepsAtWeight.reps} @ ${pr.maxRepsAtWeight.weight}kg`} />
            <Stat label={t('progress.prDate')} value={pr.date || '—'} />
          </div>
        </div>
      ) : (
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {t('progress.noData')}
          </p>
        </div>
      )}

      <div className="card">
        <p className="card-title mb-8">{t('progress.thisWeek')}</p>
        <Stat label={t('progress.totalVolume')} value={weekVol > 0 ? `${weekVol.toLocaleString()} kg` : '—'} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
