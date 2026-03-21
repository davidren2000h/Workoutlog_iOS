import type { StrengthSet } from '../types';
import { useT } from '../i18n';

interface Props {
  set: StrengthSet;
  index: number;
  onChange: (id: number, changes: Partial<StrengthSet>) => void;
  onDelete: (id: number) => void;
}

export default function SetRow({ set, index, onChange, onDelete }: Props) {
  const t = useT();
  const handleNum = (field: keyof StrengthSet, raw: string) => {
    const v = raw === '' ? 0 : parseFloat(raw);
    if (!isNaN(v)) onChange(set.id!, { [field]: v });
  };

  return (
    <div className="set-row">
      <span className="set-index">{index + 1}</span>
      <input
        className="input input-sm"
        type="number"
        inputMode="decimal"
        placeholder={t('set.kg')}
        value={set.weight || ''}
        onChange={(e) => handleNum('weight', e.target.value)}
      />
      <input
        className="input input-sm"
        type="number"
        inputMode="numeric"
        placeholder={t('set.reps')}
        value={set.reps || ''}
        onChange={(e) => handleNum('reps', e.target.value)}
      />
      <button
        className={`set-check ${set.isCompleted ? 'completed' : ''}`}
        onClick={() => onChange(set.id!, { isCompleted: !set.isCompleted })}
        title={t('set.toggleComplete')}
      />
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onDelete(set.id!)}
        title={t('set.delete')}
        style={{ padding: '4px', minWidth: 0 }}
      >
        ✕
      </button>
    </div>
  );
}
