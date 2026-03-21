import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAllData, updateProfile, createProfile } from '../db/operations';
import { seedExercisesIfEmpty } from '../db/database';
import type { UserProfile } from '../types';
import { useI18n } from '../i18n';

interface Props {
  profile: UserProfile | null;
  onProfileUpdate: () => void;
}

export default function SettingsPage({ profile, onProfileUpdate }: Props) {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name ?? '');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSaveName = async () => {
    if (!profile) return;
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === profile.name) {
      setEditingName(false);
      return;
    }
    await updateProfile(profile.id!, { name: trimmed });
    onProfileUpdate();
    setEditingName(false);
  };

  const handleCreateFromGuest = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await createProfile(trimmed);
    onProfileUpdate();
    setCreatingAccount(false);
  };

  const handleDeleteAll = async () => {
    if (!confirm(t('settings.confirmDelete1'))) return;
    if (!confirm(t('settings.confirmDelete2'))) return;
    await deleteAllData();
    await seedExercisesIfEmpty();
    alert(t('settings.deleteSuccess'));
    navigate('/');
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{t('settings.title')}</h1>

      {/* Profile card */}
      <div className="card">
        {profile ? (
          <>
            <div className="flex-between">
              <span className="card-title">{t('settings.profile')}</span>
              {!editingName && (
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingName(true)}>
                  {t('settings.edit')}
                </button>
              )}
            </div>
            {editingName ? (
              <div className="flex-gap mt-8">
                <input
                  className="input"
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  maxLength={50}
                />
                <button className="btn btn-primary btn-sm" onClick={handleSaveName}>
                  {t('settings.save')}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingName(false); setNameInput(profile.name); }}>
                  {t('settings.cancel')}
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{profile.name}</span>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {t('settings.memberSince')} {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <span className="card-title">{t('settings.guestMode')}</span>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {t('settings.guestDesc')}
            </p>
            {creatingAccount ? (
              <div className="flex-gap mt-8">
                <input
                  className="input"
                  autoFocus
                  placeholder={t('welcome.namePlaceholder')}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFromGuest()}
                  maxLength={50}
                />
                <button className="btn btn-primary btn-sm" onClick={handleCreateFromGuest} disabled={!newName.trim()}>
                  {t('settings.save')}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setCreatingAccount(false)}>
                  {t('settings.cancel')}
                </button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setCreatingAccount(true)}>
                {t('settings.createNow')}
              </button>
            )}
          </>
        )}
      </div>

      {/* Language switcher */}
      <div className="card">
        <div className="flex-between">
          <span className="card-title">{t('settings.language')}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {t('settings.langDesc')}
        </p>
        <div className="flex-gap mt-8">
          <button
            className={`btn btn-sm ${lang === 'en' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setLang('en')}
          >
            English
          </button>
          <button
            className={`btn btn-sm ${lang === 'zh' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setLang('zh')}
          >
            中文
          </button>
        </div>
      </div>

      <div className="card" onClick={() => navigate('/share')} style={{ cursor: 'pointer' }}>
        <div className="flex-between">
          <span className="card-title">{t('settings.share')}</span>
          <span style={{ color: 'var(--primary)', fontSize: 13 }}>→</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {t('settings.shareDesc')}
        </p>
      </div>

      <div className="card" onClick={() => navigate('/templates')} style={{ cursor: 'pointer' }}>
        <div className="flex-between">
          <span className="card-title">{t('settings.templates')}</span>
          <span style={{ color: 'var(--primary)', fontSize: 13 }}>→</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {t('settings.templatesDesc')}
        </p>
      </div>

      <div className="card" onClick={() => navigate('/export')} style={{ cursor: 'pointer' }}>
        <div className="flex-between">
          <span className="card-title">{t('settings.export')}</span>
          <span style={{ color: 'var(--primary)', fontSize: 13 }}>→</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {t('settings.exportDesc')}
        </p>
      </div>

      <div className="section-title" style={{ marginTop: 32 }}>{t('settings.dangerZone')}</div>
      <div className="card" style={{ borderColor: 'var(--danger)' }}>
        <p className="card-title" style={{ color: 'var(--danger)' }}>{t('settings.deleteAll')}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0' }}>
          {t('settings.deleteAllDesc')}
        </p>
        <button className="btn btn-danger btn-sm" onClick={handleDeleteAll}>
          {t('settings.deleteBtn')}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)', fontSize: 12 }}>
        <p>{t('settings.version')}</p>
        <p>{t('settings.offline')}</p>
      </div>
    </div>
  );
}
