import { useState } from 'react';
import { createProfile } from '../db/operations';
import { seedExercisesIfEmpty } from '../db/database';
import { useT } from '../i18n';

interface Props {
  onCreated: () => void;
  onGuest: () => void;
}

export default function WelcomePage({ onCreated, onGuest }: Props) {
  const t = useT();
  const [step, setStep] = useState<'choose' | 'create'>('choose');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await createProfile(trimmed);
    await seedExercisesIfEmpty();
    onCreated();
  };

  const handleGuest = async () => {
    setSaving(true);
    await seedExercisesIfEmpty();
    onGuest();
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: 24,
    maxWidth: 400,
    margin: '0 auto',
  };

  const logoBlock = (
    <>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          border: '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--primary)' }}>W</span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
        {t('welcome.title')}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
        {t('welcome.subtitle')}
      </p>
    </>
  );

  /* ── Step 1: Choose path ── */
  if (step === 'choose') {
    return (
      <div style={containerStyle}>
        {logoBlock}
        <p style={{ fontSize: 15, marginBottom: 24, textAlign: 'center' }}>
          {t('welcome.chooseHow')}
        </p>

        <button
          className="btn btn-primary btn-block"
          style={{ padding: 14, marginBottom: 8 }}
          onClick={() => setStep('create')}
        >
          {t('welcome.createAccount')}
        </button>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24 }}>
          {t('welcome.createDesc')}
        </p>

        <button
          className="btn btn-ghost btn-block"
          style={{ padding: 14 }}
          onClick={handleGuest}
          disabled={saving}
        >
          {t('welcome.guest')}
        </button>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          {t('welcome.guestDesc')}
        </p>

        {/* Disclaimer */}
        <div style={{
          marginTop: 32,
          padding: 16,
          borderRadius: 12,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          width: '100%',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            {t('welcome.aboutTitle')}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {t('welcome.aboutBody')}
          </p>
        </div>
      </div>
    );
  }

  /* ── Step 2: Account creation form ── */
  return (
    <div style={containerStyle}>
      {logoBlock}
      <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
        {t('welcome.cta')}
      </p>

      <form onSubmit={handleCreate} style={{ width: '100%' }}>
        <div className="input-group">
          <label>{t('welcome.nameLabel')}</label>
          <input
            className="input"
            type="text"
            autoFocus
            placeholder={t('welcome.namePlaceholder')}
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={!name.trim() || saving}
          style={{ marginTop: 12, padding: 14 }}
        >
          {saving ? t('welcome.creating') : t('welcome.submit')}
        </button>
      </form>

      <p style={{ marginTop: 40, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
        {t('welcome.privacy')}
      </p>
    </div>
  );
}
