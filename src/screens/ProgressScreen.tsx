import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTasks } from '../context/TaskContext';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { isTaskActiveOnDate } from '../utils/recurrence';
import { computeSafeLayoutMetrics } from '../utils/safeAreaGuard';

type HorizonLevel = 'daily' | 'weekly' | 'monthly';

interface DayBucket {
  key: string;
  label: string;
  activeCount: number;
  doneCount: number;
  rate: number;
}

export default function ProgressScreen() {
  const { tasks, categoryBreakdown } = useTasks();
  const { theme } = useAppTheme();
  const { lang } = useLanguage();
  const insets = useSafeAreaInsets();
  const metrics = computeSafeLayoutMetrics(insets);

  const [horizon, setHorizon] = useState<HorizonLevel>('daily');

  // 1. حسابات المستوى اليومي
  const dailyStats = useMemo(() => {
    const today = new Date();
    const activeToday = tasks.filter((item) => isTaskActiveOnDate(item, today));
    const total = activeToday.length > 0 ? activeToday.length : tasks.length;
    const completed =
      activeToday.length > 0
        ? activeToday.filter((item) => item.completed).length
        : tasks.filter((item) => item.completed).length;

    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
  }, [tasks]);

  // 2. حسابات المستوى الأسبوعي (آخر 7 أيام)
  const weeklyBuckets = useMemo<DayBucket[]>(() => {
    const arDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const dt = new Date(today);
      dt.setDate(today.getDate() - (6 - i));
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
        dt.getDate()
      ).padStart(2, '0')}`;

      const activeForDay = tasks.filter((t) => isTaskActiveOnDate(t, dt));
      const activeCount = activeForDay.length;
      const doneForDay = activeForDay.filter(
        (t) => t.completed || t.lastCompletedDateKey === key
      ).length;
      const rate = activeCount > 0 ? Math.round((doneForDay / activeCount) * 100) : 0;

      return {
        key,
        label: lang === 'ar' ? arDays[dt.getDay()] : enDays[dt.getDay()],
        activeCount,
        doneCount: doneForDay,
        rate,
      };
    });
  }, [tasks, lang]);

  const weeklyAverage = useMemo(() => {
    if (weeklyBuckets.length === 0) return 0;
    const sum = weeklyBuckets.reduce((acc, b) => acc + b.rate, 0);
    return Math.round(sum / weeklyBuckets.length);
  }, [weeklyBuckets]);

  // 3. حسابات المستوى الشهري (أيام الشهر الحالي)
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDay = now.getDate();

    let totalOpportunities = 0;
    let totalCompleted = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(year, month, day);
      const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
        2,
        '0'
      )}`;
      const activeOnDay = tasks.filter((t) => isTaskActiveOnDate(t, dt));
      totalOpportunities += activeOnDay.length;

      if (day === currentDay) {
        totalCompleted += activeOnDay.filter(
          (t) => t.completed || t.lastCompletedDateKey === dayKey
        ).length;
      } else if (day < currentDay) {
        totalCompleted += activeOnDay.filter((t) => t.lastCompletedDateKey === dayKey).length;
      }
    }

    const rate =
      totalOpportunities > 0 ? Math.round((totalCompleted / totalOpportunities) * 100) : 0;

    return {
      daysInMonth,
      currentDay,
      totalOpportunities,
      totalCompleted,
      rate,
    };
  }, [tasks]);

  const activeRate =
    horizon === 'daily'
      ? dailyStats.rate
      : horizon === 'weekly'
      ? weeklyAverage
      : monthlyStats.rate;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: metrics.fabBottomOffset + 12 },
      ]}
    >
      <Text style={[styles.heading, { color: theme.text }]}>
        {lang === 'ar' ? 'متابعة الإنجاز' : 'Progress Tracker'}
      </Text>

      {/* أزرار المستويات الثلاثة: يومي - أسبوعي - شهري */}
      <View style={styles.levelSwitcher}>
        {(
          [
            { key: 'daily', ar: 'يومي', en: 'Daily' },
            { key: 'weekly', ar: 'أسبوعي', en: 'Weekly' },
            { key: 'monthly', ar: 'شهري', en: 'Monthly' },
          ] as { key: HorizonLevel; ar: string; en: string }[]
        ).map((tab) => {
          const active = horizon === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.levelBtn,
                {
                  backgroundColor: active ? theme.primary : theme.card,
                  borderColor: active ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setHorizon(tab.key)}
            >
              <Text style={[styles.levelBtnText, { color: active ? '#FFFFFF' : theme.text }]}>
                {lang === 'ar' ? tab.ar : tab.en}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* بطاقة الدائرة الرئيسية للمستوى المختار */}
      <View style={[styles.circleCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View
          style={[
            styles.progressCircle,
            {
              borderColor: activeRate >= 70 ? '#10B981' : theme.primary,
              backgroundColor: `${activeRate >= 70 ? '#10B981' : theme.primary}12`,
            },
          ]}
        >
          <Text style={[styles.circlePercent, { color: theme.text }]}>{activeRate}%</Text>
          <Text style={[styles.circleSub, { color: theme.mutedText }]}>
            {horizon === 'daily'
              ? lang === 'ar'
                ? 'إنجاز اليوم'
                : 'Today'
              : horizon === 'weekly'
              ? lang === 'ar'
                ? 'متوسط الأسبوع'
                : 'Weekly Avg'
              : lang === 'ar'
              ? 'إنجاز الشهر'
              : 'Monthly'}
          </Text>
        </View>

        <View style={styles.circleSummary}>
          {horizon === 'daily' && (
            <>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>
                {lang === 'ar' ? 'ملخص إنجاز اليوم' : 'Daily Summary'}
              </Text>
              <Text style={[styles.summaryDetail, { color: theme.mutedText }]}>
                {lang === 'ar'
                  ? `المكتمل: ${dailyStats.completed} من ${dailyStats.total} مهام`
                  : `Completed: ${dailyStats.completed} of ${dailyStats.total} tasks`}
              </Text>
              <Text style={[styles.autoResetHint, { color: '#10B981' }]}>
                <Ionicons name="refresh-circle" size={14} color="#10B981" />{' '}
                {lang === 'ar'
                  ? 'يتم إعادة تعيين المهام المتكررة تلقائياً مع بداية كل يوم جديد'
                  : 'Recurring tasks reset automatically at the start of each new day'}
              </Text>
            </>
          )}

          {horizon === 'weekly' && (
            <>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>
                {lang === 'ar' ? 'أداء آخر 7 أيام' : 'Last 7 Days Performance'}
              </Text>
              <Text style={[styles.summaryDetail, { color: theme.mutedText }]}>
                {lang === 'ar'
                  ? `متوسط النسبة الأسبوعية: ${weeklyAverage}%`
                  : `Weekly average rate: ${weeklyAverage}%`}
              </Text>
            </>
          )}

          {horizon === 'monthly' && (
            <>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>
                {lang === 'ar' ? 'متابعة الشهر الحالي' : 'Current Month Tracker'}
              </Text>
              <Text style={[styles.summaryDetail, { color: theme.mutedText }]}>
                {lang === 'ar'
                  ? `اليوم ${monthlyStats.currentDay} من ${monthlyStats.daysInMonth} • المنجز: ${monthlyStats.totalCompleted} / ${monthlyStats.totalOpportunities}`
                  : `Day ${monthlyStats.currentDay} of ${monthlyStats.daysInMonth} • Done: ${monthlyStats.totalCompleted} / ${monthlyStats.totalOpportunities}`}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* رسم بياني للمستوى اليومي (توزيع الإنجاز حسب الأقسام) */}
      {horizon === 'daily' && (
        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            {lang === 'ar' ? 'الرسم البياني اليومي حسب الأقسام' : 'Daily Bar Chart by Category'}
          </Text>

          <View style={styles.barsContainer}>
            {categoryBreakdown.map((item) => {
              const barHeight = Math.max(8, Math.round((item.percentage / 100) * 130));
              return (
                <View key={item.key} style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: theme.mutedText }]}>
                    {item.percentage}%
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
                    <View
                      style={[
                        styles.barFill,
                        { height: barHeight, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: theme.text }]} numberOfLines={1}>
                    {lang === 'ar' ? item.labelAr : item.labelEn}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* رسم بياني للمستوى الأسبوعي */}
      {horizon === 'weekly' && (
        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            {lang === 'ar' ? 'الرسم البياني الأسبوعي (الأيام السبعة)' : 'Weekly Bar Chart (7 Days)'}
          </Text>

          <View style={styles.barsContainer}>
            {weeklyBuckets.map((day) => {
              const barHeight = Math.max(8, Math.round((day.rate / 100) * 130));
              return (
                <View key={day.key} style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: theme.mutedText }]}>{day.rate}%</Text>
                  <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
                    <View
                      style={[
                        styles.barFill,
                        { height: barHeight, backgroundColor: theme.primary },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: theme.text }]}>{day.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* تفاصيل المستوى الشهري */}
      {horizon === 'monthly' && (
        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            {lang === 'ar' ? 'مؤشر تقدم الشهر' : 'Monthly Progress Bar'}
          </Text>
          <View style={[styles.monthTrack, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.monthFill,
                {
                  width: `${Math.min(100, Math.max(0, monthlyStats.rate))}%`,
                  backgroundColor: '#10B981',
                },
              ]}
            />
          </View>
          <Text style={[styles.monthCaption, { color: theme.mutedText }]}>
            {lang === 'ar'
              ? `إجمالي المهام المنجزة خلال الشهر: ${monthlyStats.totalCompleted}`
              : `Total tasks completed this month: ${monthlyStats.totalCompleted}`}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 14,
  },
  levelSwitcher: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  levelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  circleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 16,
  },
  progressCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePercent: {
    fontSize: 24,
    fontWeight: '800',
  },
  circleSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  circleSummary: {
    flex: 1,
    gap: 6,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  summaryDetail: {
    fontSize: 13,
    fontWeight: '600',
  },
  autoResetHint: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 175,
    gap: 6,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  barTrack: {
    width: 20,
    height: 130,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  monthTrack: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  monthFill: {
    height: '100%',
    borderRadius: 7,
  },
  monthCaption: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
});