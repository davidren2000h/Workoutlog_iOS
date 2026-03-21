import type { Lang } from '../i18n';

/**
 * Display-time translation for built-in exercise names and body parts.
 * DB always stores the English canonical name; this map is used only for rendering.
 */

const exerciseNameMap: Record<string, string> = {
  // ── Existing ──
  'Barbell Squat':          '杠铃深蹲',
  'Barbell Bench Press':    '杠铃卧推',
  'Barbell Deadlift':       '杠铃硬拉',
  'Overhead Press':         '过头推举',
  'Barbell Row':            '杠铃划船',
  'Pull-Up':                '引体向上',
  'Dumbbell Curl':          '哑铃弯举',
  'Dumbbell Lateral Raise': '哑铃侧平举',
  'Leg Press':              '腿举',
  'Lat Pulldown':           '高位下拉',
  'Cable Fly':              '龙门架夹胸',
  'Tricep Pushdown':        '三头肌下压',
  'Romanian Deadlift':      '罗马尼亚硬拉',
  'Bulgarian Split Squat':  '保加利亚分腿蹲',
  'Plank':                  '平板支撑',
  'Running':                '跑步',
  'Cycling':                '骑行',
  'Rowing':                 '划船机',
  'Cardio':                 '有氧',
  'Skill / Sport':          '技能 / 运动',

  // ── Chest / 胸部 ──
  'Chest Press Machine':                    '器械推胸',
  'Hammer Strength Decline Chest Press':    '悍马机下斜推胸',
  'Incline Cable Fly':                      '上斜绳索夹胸',
  'Decline Cable Fly':                      '下斜绳索夹胸',
  'Assisted Dips':                          '双杠臂屈伸（辅助）',
  'Hammer Strength Incline Chest Press':    '上斜悍马机推胸',

  // ── Back / 背部 ──
  'Wide-Grip Pull-Up':                      '宽握引体向上',
  'Assisted Wide-Grip Pull-Up':             '宽握引体向上（辅助）',
  'Weighted Wide-Grip Pull-Up':             '宽握引体向上（负重）',
  'Neutral-Grip Pull-Up':                   '对握引体向上',
  'Assisted Neutral-Grip Pull-Up':          '对握引体向上（辅助）',
  'Weighted Neutral-Grip Pull-Up':          '对握引体向上（负重）',
  'Seated Row Machine':                     '器械划船',
  'Wide-Grip Lat Pulldown':                 '宽握高位下拉',
  'Close-Grip Lat Pulldown':                '窄握高位下拉',
  'V-Bar Lat Pulldown':                     'V-bar 高位下拉',
  'Bent-Over Barbell Row':                  '俯身杠铃划船',

  // ── Shoulders / 肩部 ──
  'Lateral Raise':                          '侧平举',
  'Front Raise':                            '前平举',
  'Seated Barbell Overhead Press':          '坐姿杠铃推举',
  'Push Press':                             '实力推',
  'Reverse Pec Deck Fly':                   '蝴蝶机反向飞鸟',
  'Upright Barbell Row':                    '站立杠铃划船',

  // ── Biceps / 二头 ──
  'Standing Alternating Dumbbell Curl':     '站姿哑铃交替弯举',
  'Seated Alternating Dumbbell Curl':       '坐姿哑铃交替弯举',
  'EZ-Bar Biceps Curl':                     'EZ 杆二头弯举',

  // ── Triceps / 三头 ──
  'Cable Triceps Extension':                '绳索臂屈伸',
  'V-Bar Triceps Pushdown':                 'V-bar 绳索下压',
  'Straight Bar Triceps Pushdown':          '直杆绳索下压',

  // ── Legs / 腿部 ──
  'Squat':                                  '深蹲',
  'Deadlift':                               '硬拉',

  // ── Abs / 腹部 ──
  'Sit-Up':                                 '仰卧起坐',
  'Ab Crunch Machine':                      '器械卷腹',

  // ── Cardio / 有氧 ──
  'Rowing Machine':                         '划船机',
  'Elliptical Trainer':                     '椭圆机',
  'Indoor Cycling':                         '室内自行车',
};

const bodyPartMap: Record<string, string> = {
  'Legs':       '腿部',
  'Chest':      '胸部',
  'Back':       '背部',
  'Shoulders':  '肩部',
  'Arms':       '手臂',
  'Biceps':     '二头',
  'Triceps':    '三头',
  'Core':       '核心',
  'Abs':        '腹部',
  'Cardio':     '有氧',
};

const equipmentMap: Record<string, string> = {
  'Barbell':    '杠铃',
  'Dumbbell':   '哑铃',
  'Machine':    '器械',
  'Cable':      '绳索',
  'Bodyweight': '自重',
  'None':       '无',
};

/** Translate an exercise name for display. Custom exercises stay as-is. */
export function tExercise(name: string, lang: Lang): string {
  if (lang === 'en') return name;
  return exerciseNameMap[name] ?? name;
}

/** Translate a body part for display. */
export function tBodyPart(name: string, lang: Lang): string {
  if (lang === 'en') return name;
  return bodyPartMap[name] ?? name;
}

/** Translate equipment for display. */
export function tEquipment(name: string, lang: Lang): string {
  if (lang === 'en') return name;
  return equipmentMap[name] ?? name;
}

/**
 * Filter helper: returns true if the exercise name (in either language) matches the filter.
 */
export function exerciseMatchesFilter(name: string, filter: string): boolean {
  const lower = filter.toLowerCase();
  if (name.toLowerCase().includes(lower)) return true;
  const zh = exerciseNameMap[name];
  if (zh && zh.includes(filter)) return true;
  return false;
}
