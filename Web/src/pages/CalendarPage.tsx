import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDaysInMonth, getFirstDayOfMonth, todayStr, formatDuration } from '../utils';
import { getMonthSummaries, getSessionsByDate } from '../db/operations';
import type { DaySummary, Session } from '../types';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

const DAY_KEYS: TranslationKey[] = [
  'calendar.sun', 'calendar.mon', 'calendar.tue', 'calendar.wed',
  'calendar.thu', 'calendar.fri', 'calendar.sat',
];

export default function CalendarPage() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<Session[]>([]);

  useEffect(() => {
    getMonthSummaries(year, month).then(setSummaries);
  }, [year, month]);

  const todayDate = todayStr();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const summaryMap = new Map(summaries.map((s) => [s.date, s]));

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  };

  const handleDayClick = async (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    const sessions = await getSessionsByDate(dateStr);
    setSelectedSessions(sessions);
  };

  const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
  const monthName = new Date(year, month - 1).toLocaleString(locale, { month: 'long', year: 'numeric' });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{t('calendar.title')}</h1>

      <div className="calendar-nav">
        <button className="btn btn-ghost btn-sm" onClick={prevMonth}>{t('calendar.prev')}</button>
        <span style={{ fontWeight: 600 }}>{monthName}</span>
        <button className="btn btn-ghost btn-sm" onClick={nextMonth}>{t('calendar.next')}</button>
      </div>

      <div className="calendar-grid">
        {DAY_KEYS.map((k) => (
          <div key={k} className="calendar-day-label">{t(k)}</div>
        ))}
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty" />
        ))}
        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const summary = summaryMap.get(dateStr);
          const isToday = dateStr === todayDate;
          const classes = [
            'calendar-day',
            isToday ? 'today' : '',
            summary?.hasWorkout ? 'has-workout' : '',
            selectedDate === dateStr ? 'today' : '', // reuse border style
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button key={day} className={classes} onClick={() => handleDayClick(day)}>
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="card mt-16">
          <p className="card-title mb-8">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString(locale, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          {selectedSessions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('calendar.noWorkouts')}</p>
          ) : (
            selectedSessions.map((s) => (
              <div
                key={s.id}
                className="flex-between"
                style={{ padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                onClick={() => navigate(`/session/${s.id}`)}
              >
                <span style={{ fontSize: 14 }}>
                  {t('today.workout')}{s.duration ? ` · ${formatDuration(s.duration)}` : ''}
                </span>
                <span style={{ fontSize: 12, color: 'var(--primary)' }}>{t('calendar.view')}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
