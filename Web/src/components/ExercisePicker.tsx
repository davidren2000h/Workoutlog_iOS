import { useState, useEffect, useMemo } from 'react';
import type { ExerciseReference, ActivityType } from '../types';
import { getAllExercises, addExercise } from '../db/operations';
import { useI18n } from '../i18n';
import { tExercise, tBodyPart, exerciseMatchesFilter } from '../utils/exerciseNames';

/** Display order for body-part categories */
const CATEGORY_ORDER = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Legs', 'Abs', 'Cardio',
];

interface Props {
  onSelect: (type: ActivityType, title: string) => void;
  onClose: () => void;
}

export default function ExercisePicker({ onSelect, onClose }: Props) {
  const { t, lang } = useI18n();
  const [exercises, setExercises] = useState<ExerciseReference[]>([]);
  const [filter, setFilter] = useState('');
  const [mode, setMode] = useState<'category' | 'exercises' | 'custom'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<ActivityType>('Strength');
  const [customBodyPart, setCustomBodyPart] = useState('Chest');

  useEffect(() => {
    getAllExercises().then(setExercises);
  }, []);

  /** Unique body-part categories, sorted by CATEGORY_ORDER (extras at the end) */
  const categories = useMemo(() => {
    const set = new Set(exercises.map((e) => e.bodyPart).filter(Boolean));
    return [
      ...CATEGORY_ORDER.filter((c) => set.has(c)),
      ...[...set].filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
    ];
  }, [exercises]);

  /** Exercises in the selected category, optionally filtered by search */
  const categoryExercises = useMemo(() => {
    if (!selectedCategory) return [];
    return exercises
      .filter((e) => e.bodyPart === selectedCategory)
      .filter((e) => !filter || exerciseMatchesFilter(e.name, filter));
  }, [exercises, selectedCategory, filter]);

  const handleCustom = async () => {
    if (!customName.trim()) return;
    await addExercise({
      name: customName.trim(),
      bodyPart: customBodyPart,
      equipment: '',
      isCustom: true,
    });
    onSelect(customType, customName.trim());
  };

  const goBackToCategories = () => {
    setMode('category');
    setSelectedCategory(null);
    setFilter('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        {/* ── Step 1: Category selection ── */}
        {mode === 'category' && (
          <>
            <h2>{t('picker.category')}</h2>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className="btn btn-ghost btn-block"
                  style={{ justifyContent: 'flex-start', padding: '12px 8px', fontSize: 15 }}
                  onClick={() => { setSelectedCategory(cat); setMode('exercises'); }}
                >
                  {tBodyPart(cat, lang)}
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
                    {exercises.filter((e) => e.bodyPart === cat).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-16 flex-gap">
              <button className="btn btn-ghost btn-sm" onClick={() => setMode('custom')}>
                {t('picker.custom')}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => onSelect('Cardio', 'Cardio')}>
                {t('picker.cardio')}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => onSelect('Skill', 'Skill / Sport')}>
                {t('picker.skill')}
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Exercise list within category ── */}
        {mode === 'exercises' && (
          <>
            <h2>{selectedCategory ? tBodyPart(selectedCategory, lang) : t('picker.title')}</h2>
            <input
              className="input mb-8"
              placeholder={t('picker.search')}
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {categoryExercises.map((ex) => (
                <button
                  key={ex.id}
                  className="btn btn-ghost btn-block"
                  style={{ justifyContent: 'flex-start', padding: '10px 8px' }}
                  onClick={() => onSelect('Strength', ex.name)}
                >
                  {tExercise(ex.name, lang)}
                </button>
              ))}
              {categoryExercises.length === 0 && (
                <div className="empty-state" style={{ padding: 20 }}>
                  {t('picker.noMatch')}
                </div>
              )}
            </div>
            <div className="mt-16">
              <button className="btn btn-ghost btn-sm" onClick={goBackToCategories}>
                ← {t('picker.back')}
              </button>
            </div>
          </>
        )}

        {/* ── Custom exercise form ── */}
        {mode === 'custom' && (
          <>
            <h2>{t('picker.title')}</h2>
            <div className="input-group">
              <label>{t('picker.exerciseName')}</label>
              <input
                className="input"
                autoFocus
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>{t('picker.bodyPart')}</label>
              <select
                className="input"
                value={customBodyPart}
                onChange={(e) => setCustomBodyPart(e.target.value)}
              >
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>{tBodyPart(cat, lang)}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>{t('picker.type')}</label>
              <select
                className="input"
                value={customType}
                onChange={(e) => setCustomType(e.target.value as ActivityType)}
              >
                <option value="Strength">{t('type.Strength')}</option>
                <option value="Cardio">{t('type.Cardio')}</option>
                <option value="Skill">{t('type.Skill')}</option>
              </select>
            </div>
            <div className="flex-gap mt-8">
              <button className="btn btn-primary" onClick={handleCustom}>
                {t('picker.add')}
              </button>
              <button className="btn btn-ghost" onClick={goBackToCategories}>
                ← {t('picker.back')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
