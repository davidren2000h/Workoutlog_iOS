import type { ShareStats } from '../db/operations';
import type { Lang } from '../i18n';
import { tExercise } from './exerciseNames';

/**
 * iPhone screen-sized image generator for social media sharing.
 * Canvas size: 1170 x 2532 (iPhone 14 Pro logical pixels @3x).
 * We use 1170 x 2080 to leave room for phone UI and keep the card feel.
 */

const W = 1170;
const H = 2080;

/* ── Colour palette ── */
const BG_GRADIENT_TOP = '#0f0f1a';
const BG_GRADIENT_BOT = '#1a1a2e';
const CARD_BG = 'rgba(255,255,255,0.06)';
const CARD_BORDER = 'rgba(255,255,255,0.10)';
const PRIMARY = '#6c5ce7';
const PRIMARY_LIGHT = '#a29bfe';
const TEXT_WHITE = '#ffffff';
const TEXT_DIM = 'rgba(255,255,255,0.55)';
const ACCENT_GREEN = '#00cec9';
const ACCENT_ORANGE = '#fdcb6e';

/* ── Helpers ── */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fmtDuration(sec: number, lang: Lang): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (lang === 'zh') {
    if (h > 0) return `${h}小时${m}分`;
    return `${m}分钟`;
  }
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function fmtVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg.toLocaleString()} kg`;
}

function fmtDateRange(start: string, end: string, lang: Lang): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (s.getFullYear() !== e.getFullYear()) {
    opts.year = 'numeric';
  }
  return `${s.toLocaleDateString(locale, opts)}  —  ${e.toLocaleDateString(locale, opts)}`;
}

function periodLabel(period: string, lang: Lang): string {
  const map: Record<string, { en: string; zh: string }> = {
    day:   { en: "Today's Training",   zh: '今日训练' },
    week:  { en: 'Weekly Summary',     zh: '本周总结' },
    month: { en: 'Monthly Summary',    zh: '本月总结' },
    year:  { en: 'Annual Summary',     zh: '年度总结' },
  };
  return map[period]?.[lang] ?? period;
}

const labels = {
  sessions:     { en: 'Sessions',      zh: '训练次数' },
  totalTime:    { en: 'Total Time',    zh: '总时长' },
  volume:       { en: 'Volume',        zh: '训练量' },
  activeDays:   { en: 'Active Days',   zh: '运动天数' },
  exercises:    { en: 'Exercises',     zh: '动作数' },
  topExercises: { en: 'Top Exercises', zh: '最常做的动作' },
  watermark:    { en: 'Pure Workout Log',   zh: '纯净健身日志' },
  times:        { en: 'times',         zh: '次' },
};

function l(key: keyof typeof labels, lang: Lang): string {
  return labels[key][lang];
}

/* ── Main generator ── */
export async function generateShareImage(
  stats: ShareStats,
  period: string,
  lang: Lang,
  userName: string,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Background gradient ──
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, BG_GRADIENT_TOP);
  grad.addColorStop(1, BG_GRADIENT_BOT);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = PRIMARY;
  ctx.beginPath();
  ctx.arc(W - 100, 200, 350, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, H - 300, 250, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  let y = 80;
  const PAD = 80;
  const INNER_W = W - PAD * 2;

  // ── App watermark & user name ──
  ctx.fillStyle = TEXT_DIM;
  ctx.font = '500 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(l('watermark', lang), PAD, y);

  ctx.textAlign = 'right';
  ctx.fillText(userName, W - PAD, y);
  ctx.textAlign = 'left';

  y += 70;

  // ── Period title ──
  ctx.fillStyle = TEXT_WHITE;
  ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(periodLabel(period, lang), PAD, y);
  y += 50;

  // ── Date range ──
  ctx.fillStyle = PRIMARY_LIGHT;
  ctx.font = '500 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(fmtDateRange(stats.startDate, stats.endDate, lang), PAD, y);
  y += 80;

  // ── Stat cards grid (2 x 3) ──
  const statItems = [
    { label: l('sessions', lang), value: String(stats.sessionCount), color: PRIMARY },
    { label: l('activeDays', lang), value: String(stats.activeDays), color: ACCENT_GREEN },
    { label: l('totalTime', lang), value: fmtDuration(stats.totalDuration, lang), color: ACCENT_ORANGE },
    { label: l('volume', lang), value: fmtVolume(stats.totalVolume), color: PRIMARY_LIGHT },
    { label: l('exercises', lang), value: String(stats.exerciseNames.length), color: ACCENT_GREEN },
  ];

  const CARD_GAP = 30;
  const CARD_W = (INNER_W - CARD_GAP) / 2;
  const CARD_H = 200;

  for (let i = 0; i < statItems.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = PAD + col * (CARD_W + CARD_GAP);
    const cy = y + row * (CARD_H + CARD_GAP);

    // Card background
    roundRect(ctx, cx, cy, CARD_W, CARD_H, 24);
    ctx.fillStyle = CARD_BG;
    ctx.fill();
    ctx.strokeStyle = CARD_BORDER;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Accent line
    roundRect(ctx, cx, cy, 6, CARD_H, 3);
    ctx.fillStyle = statItems[i].color;
    ctx.fill();

    // Value
    ctx.fillStyle = TEXT_WHITE;
    ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(statItems[i].value, cx + 36, cy + 90);

    // Label
    ctx.fillStyle = TEXT_DIM;
    ctx.font = '500 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(statItems[i].label, cx + 36, cy + 140);
  }

  const statRows = Math.ceil(statItems.length / 2);
  y += statRows * (CARD_H + CARD_GAP) + 30;

  // ── Top exercises card ──
  if (stats.topExercises.length > 0) {
    const listH = 60 + stats.topExercises.length * 72 + 30;
    roundRect(ctx, PAD, y, INNER_W, listH, 24);
    ctx.fillStyle = CARD_BG;
    ctx.fill();
    ctx.strokeStyle = CARD_BORDER;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = TEXT_WHITE;
    ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(l('topExercises', lang), PAD + 36, y + 52);

    let ey = y + 90;
    for (let i = 0; i < stats.topExercises.length; i++) {
      const ex = stats.topExercises[i];
      const barMaxW = INNER_W - 300;
      const maxCount = stats.topExercises[0].count;
      const barW = Math.max(40, (ex.count / maxCount) * barMaxW);

      // Bar
      roundRect(ctx, PAD + 36, ey, barW, 36, 12);
      ctx.fillStyle = PRIMARY;
      ctx.globalAlpha = 0.6 - i * 0.08;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Name
      ctx.fillStyle = TEXT_WHITE;
      ctx.font = '500 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(tExercise(ex.name, lang), PAD + 52, ey + 27);

      // Count
      ctx.fillStyle = TEXT_DIM;
      ctx.font = '400 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${ex.count} ${l('times', lang)}`, W - PAD - 36, ey + 27);
      ctx.textAlign = 'left';

      ey += 72;
    }

    y += listH + 40;
  }

  // ── Bottom decoration ──
  ctx.fillStyle = TEXT_DIM;
  ctx.font = '400 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  const bottomText = lang === 'zh'
    ? '由「健身日志」生成 · 离线优先 PWA'
    : 'Generated by Pure Workout Log · Offline-first PWA';
  ctx.fillText(bottomText, W / 2, H - 60);

  // Small dumbbell icon (simple lines)
  const dbY = H - 120;
  ctx.strokeStyle = TEXT_DIM;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, dbY);
  ctx.lineTo(W / 2 + 40, dbY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W / 2 - 50, dbY - 12);
  ctx.lineTo(W / 2 - 50, dbY + 12);
  ctx.moveTo(W / 2 - 40, dbY - 8);
  ctx.lineTo(W / 2 - 40, dbY + 8);
  ctx.moveTo(W / 2 + 40, dbY - 8);
  ctx.lineTo(W / 2 + 40, dbY + 8);
  ctx.moveTo(W / 2 + 50, dbY - 12);
  ctx.lineTo(W / 2 + 50, dbY + 12);
  ctx.stroke();

  ctx.textAlign = 'left';

  return canvas;
}
