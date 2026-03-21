import { useState } from 'react';
import type { CardioEntry } from '../types';
import { useT } from '../i18n';

interface Props {
  entry?: CardioEntry;
  activityId: number;
  onSave: (activityId: number, data: Partial<CardioEntry>) => void;
}

export default function CardioForm({ entry, activityId, onSave }: Props) {
  const t = useT();
  const [duration, setDuration] = useState(entry?.duration ?? 0);
  const [distance, setDistance] = useState(entry?.distance ?? 0);
  const [avgHr, setAvgHr] = useState(entry?.avgHr ?? 0);
  const [rpe, setRpe] = useState(entry?.rpe ?? 0);

  const save = () => onSave(activityId, { duration, distance, avgHr, rpe });

  return (
    <div>
      <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: 1, minWidth: 100 }}>
          <label>{t('cardio.duration')}</label>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            value={duration ? Math.round(duration / 60) : ''}
            onChange={(e) => setDuration(parseInt(e.target.value || '0') * 60)}
            onBlur={save}
          />
        </div>
        <div className="input-group" style={{ flex: 1, minWidth: 100 }}>
          <label>{t('cardio.distance')}</label>
          <input
            className="input"
            type="number"
            inputMode="decimal"
            value={distance || ''}
            onChange={(e) => setDistance(parseFloat(e.target.value || '0'))}
            onBlur={save}
          />
        </div>
        <div className="input-group" style={{ flex: 1, minWidth: 80 }}>
          <label>{t('cardio.avgHr')}</label>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            value={avgHr || ''}
            onChange={(e) => setAvgHr(parseInt(e.target.value || '0'))}
            onBlur={save}
          />
        </div>
        <div className="input-group" style={{ flex: 1, minWidth: 60 }}>
          <label>{t('cardio.rpe')}</label>
          <input
            className="input"
            type="number"
            inputMode="decimal"
            value={rpe || ''}
            onChange={(e) => setRpe(parseFloat(e.target.value || '0'))}
            onBlur={save}
          />
        </div>
      </div>
    </div>
  );
}
