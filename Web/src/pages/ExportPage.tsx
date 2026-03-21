import { useState } from 'react';
import { exportJSON, exportCSV } from '../db/operations';
import { downloadBlob, todayStr } from '../utils';
import { useT } from '../i18n';

export default function ExportPage() {
  const t = useT();
  const today = todayStr();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [endDate, setEndDate] = useState(today);
  const [status, setStatus] = useState('');

  const handleExportJSON = async () => {
    setStatus(t('export.exporting'));
    const data = await exportJSON(startDate, endDate);
    downloadBlob(data, `workout-log-${startDate}-to-${endDate}.json`, 'application/json');
    setStatus(t('export.jsonDone'));
  };

  const handleExportCSV = async () => {
    setStatus(t('export.exporting'));
    const data = await exportCSV(startDate, endDate);
    downloadBlob(data, `workout-log-${startDate}-to-${endDate}.csv`, 'text/csv');
    setStatus(t('export.csvDone'));
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{t('export.title')}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        {t('export.desc')}
      </p>

      <div className="card">
        <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: 1, minWidth: 140 }}>
            <label>{t('export.from')}</label>
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="input-group" style={{ flex: 1, minWidth: 140 }}>
            <label>{t('export.to')}</label>
            <input
              className="input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          <button className="btn btn-primary btn-block" onClick={handleExportJSON}>
            {t('export.json')}
          </button>
          <button className="btn btn-ghost btn-block" onClick={handleExportCSV}>
            {t('export.csv')}
          </button>
        </div>

        {status && (
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--success)', textAlign: 'center' }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
