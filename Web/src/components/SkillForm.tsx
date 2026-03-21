import { useState } from 'react';
import type { SkillEntry } from '../types';
import { useT } from '../i18n';

interface Props {
  entry?: SkillEntry;
  activityId: number;
  onSave: (activityId: number, data: Partial<SkillEntry>) => void;
}

export default function SkillForm({ entry, activityId, onSave }: Props) {
  const t = useT();
  const [duration, setDuration] = useState(entry?.duration ?? 0);
  const [rpe, setRpe] = useState(entry?.rpe ?? 0);
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [tagsStr, setTagsStr] = useState((entry?.tags ?? []).join(', '));

  const save = () =>
    onSave(activityId, {
      duration,
      rpe,
      notes,
      tags: tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

  return (
    <div>
      <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: 1, minWidth: 100 }}>
          <label>{t('skill.duration')}</label>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            value={duration ? Math.round(duration / 60) : ''}
            onChange={(e) => setDuration(parseInt(e.target.value || '0') * 60)}
            onBlur={save}
          />
        </div>
        <div className="input-group" style={{ flex: 1, minWidth: 60 }}>
          <label>{t('skill.rpe')}</label>
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
      <div className="input-group">
        <label>{t('skill.notes')}</label>
        <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={save} />
      </div>
      <div className="input-group">
        <label>{t('skill.tags')}</label>
        <input className="input" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} onBlur={save} />
      </div>
    </div>
  );
}
