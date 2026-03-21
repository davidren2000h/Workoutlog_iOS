import { useState, useRef } from 'react';
import { useI18n } from '../i18n';
import { getShareStats } from '../db/operations';
import type { ShareStats } from '../db/operations';
import { generateShareImage } from '../utils/shareImage';
import { getProfile } from '../db/operations';
import { todayStr } from '../utils';

type Period = 'day' | 'week' | 'month' | 'year';

function getDateRange(period: Period): { start: string; end: string } {
  const now = new Date();
  const end = todayStr();
  let start: Date;

  switch (period) {
    case 'day':
      return { start: end, end };
    case 'week': {
      start = new Date(now);
      const dow = now.getDay(); // 0=Sun
      start.setDate(now.getDate() - ((dow + 6) % 7)); // Monday
      break;
    }
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
  }

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { start: fmt(start!), end };
}

export default function SharePage() {
  const { t, lang } = useI18n();
  const [period, setPeriod] = useState<Period>('week');
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [noData, setNoData] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setImageUrl(null);
    setNoData(false);

    try {
      const { start, end } = getDateRange(period);
      const stats: ShareStats = await getShareStats(start, end);

      if (stats.sessionCount === 0) {
        setNoData(true);
        setGenerating(false);
        return;
      }

      const profile = await getProfile();
      const userName = profile?.name ?? '';

      const canvas = await generateShareImage(stats, period, lang, userName);
      const url = canvas.toDataURL('image/png');
      setImageUrl(url);

      // Scroll preview into view
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `workout-${period}-${todayStr()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const periods: { key: Period; labelKey: 'share.day' | 'share.week' | 'share.month' | 'share.year' }[] = [
    { key: 'day', labelKey: 'share.day' },
    { key: 'week', labelKey: 'share.week' },
    { key: 'month', labelKey: 'share.month' },
    { key: 'year', labelKey: 'share.year' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{t('share.title')}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        {t('share.desc')}
      </p>

      {/* Period selector */}
      <div className="card">
        <p className="card-title mb-8">{t('share.period')}</p>
        <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
          {periods.map((p) => (
            <button
              key={p.key}
              className={`btn btn-sm ${period === p.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setPeriod(p.key); setImageUrl(null); setNoData(false); }}
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary btn-block mt-16"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? t('share.generating') : t('share.generate')}
        </button>
      </div>

      {noData && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, padding: 16 }}>
            {t('share.noData')}
          </p>
        </div>
      )}

      {/* Preview */}
      {imageUrl && (
        <div ref={previewRef}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img
              src={imageUrl}
              alt="Share preview"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: 12,
              }}
            />
          </div>
          <button
            className="btn btn-primary btn-block mt-8"
            onClick={handleSave}
          >
            {t('share.save')}
          </button>
        </div>
      )}
    </div>
  );
}
