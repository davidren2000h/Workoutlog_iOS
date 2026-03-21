import { useState, useEffect } from 'react';
import type { WorkoutTemplate, TemplateActivity, ActivityType } from '../types';
import { getAllTemplates, saveTemplate, deleteTemplate } from '../db/operations';
import { useI18n } from '../i18n';
import { tExercise } from '../utils/exerciseNames';

export default function TemplatesPage() {
  const { t, lang } = useI18n();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [editing, setEditing] = useState<WorkoutTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => getAllTemplates().then(setTemplates);

  const handleNew = () => {
    setEditing({ name: '', activities: [] });
  };

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) return;
    await saveTemplate(editing);
    setEditing(null);
    await loadTemplates();
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('templates.confirmDelete'))) return;
    await deleteTemplate(id);
    await loadTemplates();
  };

  const addTemplateActivity = () => {
    if (!editing) return;
    const newAct: TemplateActivity = {
      type: 'Strength',
      title: '',
      order: editing.activities.length,
      sets: 3,
    };
    setEditing({ ...editing, activities: [...editing.activities, newAct] });
  };

  const updateTemplateActivity = (idx: number, changes: Partial<TemplateActivity>) => {
    if (!editing) return;
    const acts = [...editing.activities];
    acts[idx] = { ...acts[idx], ...changes };
    setEditing({ ...editing, activities: acts });
  };

  const removeTemplateActivity = (idx: number) => {
    if (!editing) return;
    const acts = editing.activities.filter((_, i) => i !== idx);
    setEditing({ ...editing, activities: acts });
  };

  return (
    <div>
      <div className="flex-between mb-16">
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('templates.title')}</h1>
        <button className="btn btn-primary btn-sm" onClick={handleNew}>
          {t('templates.new')}
        </button>
      </div>

      {/* Template list */}
      {templates.map((tpl) => (
        <div key={tpl.id} className="card">
          <div className="flex-between">
            <span className="card-title">{tpl.name}</span>
            <div className="flex-gap">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setEditing({ ...tpl })}
              >
                {t('templates.edit')}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--danger)' }}
                onClick={() => handleDelete(tpl.id!)}
              >
                {t('templates.delete')}
              </button>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            {tpl.activities.map((a, i) => (
              <div key={i} style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {tExercise(a.title, lang) || t('templates.unnamed')} · {t(`type.${a.type}` as any)}
                {a.sets ? ` · ${a.sets} ${t('today.sets')}` : ''}
              </div>
            ))}
          </div>
        </div>
      ))}

      {templates.length === 0 && !editing && (
        <div className="empty-state">
          <h3>{t('templates.emptyTitle')}</h3>
          <p>{t('templates.emptyDesc')}</p>
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing.id ? t('templates.editTitle') : t('templates.newTitle')}</h2>

            <div className="input-group">
              <label>{t('templates.nameLabel')}</label>
              <input
                className="input"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder={t('templates.namePlaceholder')}
              />
            </div>

            <p className="section-title" style={{ marginTop: 8 }}>{t('templates.exercises')}</p>
            {editing.activities.map((a, i) => (
              <div key={i} className="card" style={{ padding: 10 }}>
                <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
                  <input
                    className="input"
                    style={{ flex: 2, minWidth: 120 }}
                    placeholder={t('templates.exerciseName')}
                    value={a.title}
                    onChange={(e) => updateTemplateActivity(i, { title: e.target.value })}
                  />
                  <select
                    className="input"
                    style={{ flex: 1, minWidth: 90 }}
                    value={a.type}
                    onChange={(e) =>
                      updateTemplateActivity(i, { type: e.target.value as ActivityType })
                    }
                  >
                    <option value="Strength">{t('type.Strength')}</option>
                    <option value="Cardio">{t('type.Cardio')}</option>
                    <option value="Skill">{t('type.Skill')}</option>
                  </select>
                  {a.type === 'Strength' && (
                    <input
                      className="input input-sm"
                      type="number"
                      style={{ width: 50 }}
                      placeholder={t('templates.setsLabel')}
                      value={a.sets ?? ''}
                      onChange={(e) =>
                        updateTemplateActivity(i, { sets: parseInt(e.target.value) || 0 })
                      }
                    />
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => removeTemplateActivity(i)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <button className="btn btn-ghost btn-sm mt-8" onClick={addTemplateActivity}>
              {t('templates.addExercise')}
            </button>

            <div className="flex-gap mt-16">
              <button className="btn btn-primary" onClick={handleSave}>
                {t('templates.save')}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>
                {t('templates.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
