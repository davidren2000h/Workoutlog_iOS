import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'en' | 'zh';

/* ══════════════════════════════════════
   Translation dictionary
   ══════════════════════════════════════ */

const translations = {
  /* ── Nav ── */
  'nav.today':       { en: 'Today',        zh: '今天' },
  'nav.calendar':    { en: 'Calendar',     zh: '日历' },
  'nav.progress':    { en: 'Progress',     zh: '进度' },
  'nav.more':        { en: 'More',         zh: '更多' },

  /* ── Welcome Page ── */
  'welcome.title':        { en: 'Pure Workout Log',                       zh: '纯净健身日志' },
  'welcome.subtitle':     { en: 'Offline Workout Log | No Ads | No IAP',  zh: '离线健身日志 | 无广告 | 无内购' },
  'welcome.chooseHow':    { en: 'How would you like to start?',           zh: '您想如何开始？' },
  'welcome.createAccount':{ en: 'Create a Local Account',                 zh: '创建本地账户' },
  'welcome.createDesc':   { en: 'No password needed. All data stored locally.', zh: '无需密码。所有数据保存在本地。' },
  'welcome.guest':        { en: 'Continue as Guest',                      zh: '以访客身份继续' },
  'welcome.guestDesc':    { en: 'Start right away. You can create an account later in Settings.', zh: '立即开始。稍后可在设置中创建账户。' },
  'welcome.cta':          { en: 'Create your account to get started.',     zh: '创建账户，开始记录。' },
  'welcome.nameLabel':    { en: 'Your Name',                              zh: '你的名字' },
  'welcome.namePlaceholder': { en: 'e.g., Alex',                          zh: '例如：小明' },
  'welcome.submit':       { en: 'Get Started',                            zh: '开始使用' },
  'welcome.creating':     { en: 'Creating...',                            zh: '创建中...' },
  'welcome.privacy':      { en: 'No password needed. Your data stays on this device.', zh: '无需密码。数据保存在本设备上。' },
  'welcome.aboutTitle':   { en: 'About This App', zh: '关于此应用' },
  'welcome.aboutBody':    { en: 'This is a simple workout logging app. There are no ads, no in-app purchases, and no user accounts required. All data is stored locally on your device and the app works completely offline.', zh: '这是一款简单的健身记录应用。没有广告、没有内购、无需账户。所有数据存储在您的设备本地，应用完全离线运行。' },

  /* ── Today Page ── */
  'today.title':           { en: 'Today',                                 zh: '今天' },
  'today.inProgress':      { en: '● In Progress',                        zh: '● 进行中' },
  'today.exercises':       { en: 'exercises',                             zh: '个动作' },
  'today.sets':            { en: 'sets',                                  zh: '组' },
  'today.completed':       { en: 'Completed',                            zh: '已完成' },
  'today.workout':         { en: 'Workout',                              zh: '训练' },
  'today.delete':          { en: 'Delete',                               zh: '删除' },
  'today.confirmDelete':   { en: 'Delete this workout?',                 zh: '删除此训练？' },
  'today.emptyTitle':      { en: 'No workouts today',                    zh: '今天还没有训练' },
  'today.emptyDesc':       { en: 'Start a new workout to begin tracking.', zh: '开始新的训练来记录吧。' },
  'today.startBlank':      { en: 'Start Blank Workout',                  zh: '开始空白训练' },
  'today.startTemplate':   { en: 'Start from Template',                  zh: '从模板开始' },
  'today.templates':       { en: 'Templates',                            zh: '模板' },

  /* ── Session Page ── */
  'session.back':           { en: '← Back',                              zh: '← 返回' },
  'session.finish':         { en: 'Finish Workout',                      zh: '结束训练' },
  'session.completedMin':   { en: 'Completed',                           zh: '已完成' },
  'session.min':            { en: 'min',                                 zh: '分钟' },
  'session.weight':         { en: 'Weight',                              zh: '重量' },
  'session.reps':           { en: 'Reps',                                zh: '次数' },
  'session.rpe':            { en: 'RPE',                                 zh: '强度' },
  'session.effort':          { en: 'Effort',                              zh: '强度' },
  'session.effortEasy':      { en: 'Easy',                                zh: '轻松' },
  'session.effortMedium':    { en: 'Medium',                              zh: '中等' },
  'session.effortHard':      { en: 'Hard',                                zh: '困难' },
  'session.addSet':         { en: '+ Add Set',                           zh: '+ 添加组' },
  'session.addExercise':    { en: '+ Add Exercise',                      zh: '+ 添加动作' },
  'session.notes':          { en: 'Session Notes',                       zh: '训练备注' },
  'session.notesPlaceholder': { en: 'How did it feel?',                  zh: '感觉怎么样？' },
  'session.loading':        { en: 'Loading...',                          zh: '加载中...' },

  /* ── Exercise Picker ── */
  'picker.title':           { en: 'Add Exercise',                        zh: '添加动作' },
  'picker.category':        { en: 'Choose Category',                     zh: '选择分类' },
  'picker.search':          { en: 'Search exercises...',                  zh: '搜索动作...' },
  'picker.noMatch':         { en: 'No matches',                          zh: '没有匹配' },
  'picker.custom':          { en: '+ Custom exercise',                   zh: '+ 自定义动作' },
  'picker.cardio':          { en: '+ Cardio',                            zh: '+ 有氧' },
  'picker.skill':           { en: '+ Skill',                             zh: '+ 技能' },
  'picker.exerciseName':    { en: 'Exercise Name',                       zh: '动作名称' },
  'picker.bodyPart':        { en: 'Category',                            zh: '分类' },
  'picker.type':            { en: 'Type',                                zh: '类型' },
  'picker.add':             { en: 'Add',                                 zh: '添加' },
  'picker.back':            { en: 'Back',                                zh: '返回' },

  /* ── Set Row ── */
  'set.kg':                 { en: 'kg',                                  zh: '公斤' },
  'set.reps':               { en: 'reps',                                zh: '次' },
  'set.toggleComplete':     { en: 'Toggle complete',                     zh: '切换完成' },
  'set.delete':             { en: 'Delete set',                          zh: '删除组' },

  /* ── Cardio Form ── */
  'cardio.duration':        { en: 'Duration (min)',                      zh: '时长（分钟）' },
  'cardio.distance':        { en: 'Distance (km)',                       zh: '距离（公里）' },
  'cardio.avgHr':           { en: 'Avg HR',                              zh: '平均心率' },
  'cardio.rpe':             { en: 'RPE',                                 zh: 'RPE' },

  /* ── Skill Form ── */
  'skill.duration':         { en: 'Duration (min)',                      zh: '时长（分钟）' },
  'skill.rpe':              { en: 'RPE',                                 zh: 'RPE' },
  'skill.notes':            { en: 'Notes',                               zh: '备注' },
  'skill.tags':             { en: 'Tags (comma-separated)',              zh: '标签（逗号分隔）' },

  /* ── Calendar Page ── */
  'calendar.title':         { en: 'Calendar',                            zh: '日历' },
  'calendar.prev':          { en: '← Prev',                              zh: '← 上月' },
  'calendar.next':          { en: 'Next →',                              zh: '下月 →' },
  'calendar.noWorkouts':    { en: 'No workouts',                         zh: '无训练' },
  'calendar.view':          { en: 'View →',                              zh: '查看 →' },
  'calendar.sun':           { en: 'Sun',  zh: '日' },
  'calendar.mon':           { en: 'Mon',  zh: '一' },
  'calendar.tue':           { en: 'Tue',  zh: '二' },
  'calendar.wed':           { en: 'Wed',  zh: '三' },
  'calendar.thu':           { en: 'Thu',  zh: '四' },
  'calendar.fri':           { en: 'Fri',  zh: '五' },
  'calendar.sat':           { en: 'Sat',  zh: '六' },

  /* ── Progress Page ── */
  'progress.title':         { en: 'Progress',                            zh: '进度' },
  'progress.exercise':      { en: 'Exercise',                            zh: '动作' },
  'progress.pr':            { en: 'Personal Records',                    zh: '个人最佳' },
  'progress.maxWeight':     { en: 'Max Weight',                          zh: '最大重量' },
  'progress.repsAtMax':     { en: 'Reps @ Max',                          zh: '最大重量次数' },
  'progress.bestReps':      { en: 'Best Reps',                           zh: '最佳次数' },
  'progress.prDate':        { en: 'PR Date',                             zh: '最佳日期' },
  'progress.thisWeek':      { en: 'This Week',                           zh: '本周' },
  'progress.totalVolume':   { en: 'Total Volume',                        zh: '总训练量' },
  'progress.noData':        { en: 'No completed sets recorded for this exercise yet.', zh: '暂无此动作的完成记录。' },

  /* ── Templates Page ── */
  'templates.title':        { en: 'Templates',                           zh: '模板' },
  'templates.new':          { en: '+ New',                               zh: '+ 新建' },
  'templates.edit':         { en: 'Edit',                                zh: '编辑' },
  'templates.delete':       { en: 'Delete',                              zh: '删除' },
  'templates.confirmDelete': { en: 'Delete this template?',              zh: '删除此模板？' },
  'templates.unnamed':      { en: '(unnamed)',                           zh: '（未命名）' },
  'templates.emptyTitle':   { en: 'No templates yet',                    zh: '暂无模板' },
  'templates.emptyDesc':    { en: 'Create a template to speed up your daily logging.', zh: '创建模板来加速每日记录。' },
  'templates.editTitle':    { en: 'Edit Template',                       zh: '编辑模板' },
  'templates.newTitle':     { en: 'New Template',                        zh: '新建模板' },
  'templates.nameLabel':    { en: 'Template Name',                       zh: '模板名称' },
  'templates.namePlaceholder': { en: 'e.g., Push Day',                   zh: '例如：推日' },
  'templates.exercises':    { en: 'Exercises',                           zh: '动作' },
  'templates.exerciseName': { en: 'Exercise name',                       zh: '动作名称' },
  'templates.addExercise':  { en: '+ Add Exercise',                      zh: '+ 添加动作' },
  'templates.save':         { en: 'Save',                                zh: '保存' },
  'templates.cancel':       { en: 'Cancel',                              zh: '取消' },
  'templates.setsLabel':    { en: 'Sets',                                zh: '组数' },

  /* ── Export Page ── */
  'export.title':           { en: 'Export Data',                         zh: '导出数据' },
  'export.desc':            { en: 'Export your workout history. You own all your data.', zh: '导出你的训练记录。你拥有所有数据。' },
  'export.from':            { en: 'From',                                zh: '开始日期' },
  'export.to':              { en: 'To',                                  zh: '结束日期' },
  'export.json':            { en: 'Export as JSON',                      zh: '导出为 JSON' },
  'export.csv':             { en: 'Export as CSV',                       zh: '导出为 CSV' },
  'export.exporting':       { en: 'Exporting...',                        zh: '导出中...' },
  'export.jsonDone':        { en: 'JSON exported!',                      zh: 'JSON 已导出！' },
  'export.csvDone':         { en: 'CSV exported!',                       zh: 'CSV 已导出！' },

  /* ── Settings Page ── */
  'settings.title':         { en: 'Settings',                            zh: '设置' },
  'settings.profile':       { en: 'Profile',                             zh: '个人资料' },
  'settings.guestMode':     { en: 'Guest Mode',                           zh: '访客模式' },
  'settings.guestDesc':     { en: 'You are using the app as a guest.',    zh: '您正在以访客身份使用。' },
  'settings.createNow':     { en: 'Create Account',                       zh: '创建账户' },
  'settings.edit':          { en: 'Edit',                                zh: '编辑' },
  'settings.save':          { en: 'Save',                                zh: '保存' },
  'settings.cancel':        { en: 'Cancel',                              zh: '取消' },
  'settings.memberSince':   { en: 'Member since',                        zh: '注册于' },
  'settings.templates':     { en: 'Workout Templates',                   zh: '训练模板' },
  'settings.templatesDesc': { en: 'Create and manage reusable workout plans', zh: '创建和管理可重复使用的训练计划' },
  'settings.export':        { en: 'Export Data',                         zh: '导出数据' },
  'settings.exportDesc':    { en: 'Download your workout history as JSON or CSV', zh: '将训练记录下载为 JSON 或 CSV' },
  'settings.language':      { en: 'Language',                            zh: '语言' },
  'settings.langDesc':      { en: 'Switch between English and Chinese',  zh: '切换中文和英文' },
  'settings.dangerZone':    { en: 'Danger Zone',                         zh: '危险区域' },
  'settings.deleteAll':     { en: 'Delete All Data',                     zh: '删除所有数据' },
  'settings.deleteAllDesc': { en: 'Permanently remove all sessions, exercises, and templates.', zh: '永久删除所有训练、动作和模板。' },
  'settings.deleteBtn':     { en: 'Delete Everything',                   zh: '删除全部' },
  'settings.confirmDelete1': { en: 'This will permanently delete ALL your workout data. Are you sure?', zh: '这将永久删除所有训练数据，确定吗？' },
  'settings.confirmDelete2': { en: 'This cannot be undone. Continue?',   zh: '此操作不可撤销，继续吗？' },
  'settings.deleteSuccess': { en: 'All data deleted.',                   zh: '所有数据已删除。' },
  'settings.version':       { en: 'Pure Workout Log v1.0.0',             zh: '纯净健身日志 v1.0.0' },
  'settings.offline':       { en: 'Offline-first PWA · Your data stays on your device', zh: '离线优先 PWA · 数据保存在你的设备上' },

  /* ── Share Page ── */
  'share.title':            { en: 'Share',                                zh: '分享' },
  'share.desc':             { en: 'Generate an image of your training record to share on social media.', zh: '生成训练记录图片，分享到社交媒体。' },
  'share.period':           { en: 'Time Period',                          zh: '时间范围' },
  'share.day':              { en: 'Today',                                zh: '今天' },
  'share.week':             { en: 'This Week',                            zh: '本周' },
  'share.month':            { en: 'This Month',                           zh: '本月' },
  'share.year':             { en: 'This Year',                            zh: '今年' },
  'share.generate':         { en: 'Generate Image',                       zh: '生成图片' },
  'share.generating':       { en: 'Generating...',                        zh: '生成中...' },
  'share.save':             { en: 'Save Image',                           zh: '保存图片' },
  'share.noData':           { en: 'No workout data in this period.',      zh: '该时段暂无训练数据。' },
  'share.sessions':         { en: 'Sessions',                             zh: '训练次数' },
  'share.totalTime':        { en: 'Total Time',                           zh: '总时长' },
  'share.totalVolume':      { en: 'Total Volume',                         zh: '总训练量' },
  'share.exercises':        { en: 'Exercises',                            zh: '动作数' },
  'share.topExercises':     { en: 'Top Exercises',                        zh: '最常做的动作' },
  'share.watermark':        { en: 'Pure Workout Log',                     zh: '纯净健身日志' },
  'share.dateRange':        { en: 'Date Range',                           zh: '日期范围' },
  'share.sets':             { en: 'sets',                                 zh: '组' },
  'share.activeDays':       { en: 'Active Days',                          zh: '运动天数' },

  /* ── Settings: share ── */
  'settings.share':         { en: 'Share Training',                       zh: '分享训练' },
  'settings.shareDesc':     { en: 'Generate a picture for social media sharing', zh: '生成训练记录图片分享到社交媒体' },

  /* ── Rest Timer ── */
  'rest.title':             { en: 'Rest',                                zh: '休息' },
  'rest.start':             { en: 'Start',                               zh: '开始' },
  'rest.pause':             { en: 'Pause',                               zh: '暂停' },
  'rest.resume':            { en: 'Resume',                              zh: '继续' },
  'rest.skip':              { en: 'Skip',                                zh: '跳过' },
  'rest.done':              { en: 'Done!',                               zh: '结束！' },
  'rest.editDefault':       { en: 'Edit default rest time',              zh: '编辑默认休息时间' },

  /* ── Activity types ── */
  'type.Strength':          { en: 'Strength',                            zh: '力量' },
  'type.Cardio':            { en: 'Cardio',                              zh: '有氧' },
  'type.Skill':             { en: 'Skill',                               zh: '技能' },
} as const;

export type TranslationKey = keyof typeof translations;

/* ══════════════════════════════════════
   Context & Hook
   ══════════════════════════════════════ */

const STORAGE_KEY = 'workoutlog-lang';

function getStoredLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'zh' || v === 'en') return v;
  } catch { /* ignore */ }
  // Auto-detect from browser
  const nav = navigator.language?.toLowerCase() ?? '';
  return nav.startsWith('zh') ? 'zh' : 'en';
}

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getStoredLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  };

  const t = (key: TranslationKey): string => {
    const entry = translations[key];
    return entry?.[lang] ?? key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Shorthand: just the t function */
export function useT() {
  return useContext(I18nContext).t;
}
