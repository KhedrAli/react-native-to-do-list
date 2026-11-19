const ARABIC_WEEKDAYS = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

const ENGLISH_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatReadableDate(date: Date, lang: 'ar' | 'en'): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dayName =
    lang === 'ar' ? ARABIC_WEEKDAYS[date.getDay()] : ENGLISH_WEEKDAYS[date.getDay()];
  // اليوم / الشهر / السنة ثم مسافة ثم اسم اليوم
  return `${d}/${m}/${y} ${dayName}`;
}

export function parseDateKeyFromFormatted(formatted?: string): string | null {
  if (!formatted) return null;
  // صيغة DD/MM/YYYY
  const dmyMatch = formatted.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (dmyMatch) {
    const [, dd, mm, yyyy] = dmyMatch;
    return `${yyyy}-${mm}-${dd}`;
  }
  // دعم احتياطي لصيغة YYYY/MM/DD أو YYYY-MM-DD
  const ymdSlash = formatted.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  if (ymdSlash) {
    return `${ymdSlash[1]}-${ymdSlash[2]}-${ymdSlash[3]}`;
  }
  const ymdDash = formatted.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (ymdDash) {
    return `${ymdDash[1]}-${ymdDash[2]}-${ymdDash[3]}`;
  }
  return null;
}

export function buildMonthCalendarDays(year: number, monthIndex: number, lang: 'ar' | 'en') {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startWeekday = firstDayOfMonth.getDay(); // 0 = الأحد ... 6 = السبت

  const cells: Array<{
    key: string;
    dayNumber: number | null;
    dateKey?: string;
    formatted?: string;
  }> = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push({ key: `empty-${i}`, dayNumber: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(year, monthIndex, day);
    cells.push({
      key: `day-${year}-${monthIndex}-${day}`,
      dayNumber: day,
      dateKey: toDateKey(dt),
      formatted: formatReadableDate(dt, lang),
    });
  }

  return cells;
}