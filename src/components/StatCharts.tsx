import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CategoryBreakdownItem } from '../context/TaskContext';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { PriorityLevel, TaskItem } from '../types/task';

interface StatChartsProps {
  tasks?: TaskItem[];
  totalTasks: number;
  completedTasks: number;
  todayActiveCount: number;
  completionRate: number;
  breakdown: CategoryBreakdownItem[];
}

export const StatCharts: React.FC<StatChartsProps> = ({
  tasks = [],
  totalTasks,
  completedTasks,
  todayActiveCount,
  completionRate,
  breakdown,
}) => {
  const { theme } = useAppTheme();
  const { lang, t } = useLanguage();

  const priorityChartData = useMemo(() => {
    const levels: Array<{ key: PriorityLevel; color: string }> = [
      { key: 'high', color: '#EF4444' },
      { key: 'medium', color: '#F59E0B' },
      { key: 'low', color: '#10B981' },
    ];

    return levels.map((lvl) => {
      const count = tasks.filter((item) => item.priority === lvl.key).length;
      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      return {
        key: lvl.key,
        label: t(lvl.key),
        color: lvl.color,
        count,
        percentage,
      };
    });
  }, [tasks, totalTasks, t]);

  return (
    <View>
      <View style={styles.summaryGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.mutedText }]}>{t('completionRate')}</Text>
          <Text style={[styles.statValue, { color: theme.primary }]}>{completionRate}%</Text>
          <Text style={[styles.statSub, { color: theme.mutedText }]}>
            {completedTasks} / {totalTasks}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.mutedText }]}>{t('todayTasksCount')}</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{todayActiveCount}</Text>
          <Text style={[styles.statSub, { color: theme.mutedText }]}>{t('tasksTab')}</Text>
        </View>
      </View>

      <View style={[styles.breakdownBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('interestAreas')}</Text>

        {breakdown.map((item) => (
          <View key={item.key} style={styles.barRow}>
            <View style={styles.barLabelRow}>
              <Text style={[styles.categoryName, { color: theme.text }]}>
                {lang === 'ar' ? item.labelAr : item.labelEn}
              </Text>
              <Text style={[styles.categoryStats, { color: theme.mutedText }]}>
                {item.count} ({item.percentage}%)
              </Text>
            </View>

            <View style={[styles.track, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* رسم بياني إضافي: توزيع المهام حسب الأولوية */}
      <View
        style={[
          styles.breakdownBox,
          styles.extraChartBox,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {lang === 'ar' ? 'الرسم البياني للأولويات' : 'Priority Distribution Chart'}
        </Text>

        <View style={styles.columnsChart}>
          {priorityChartData.map((pItem) => {
            const barHeight = Math.max(10, Math.round((pItem.percentage / 100) * 115));
            return (
              <View key={pItem.key} style={styles.colItem}>
                <Text style={[styles.colPercent, { color: theme.mutedText }]}>
                  {pItem.percentage}% ({pItem.count})
                </Text>
                <View style={[styles.colTrack, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.colFill,
                      { height: barHeight, backgroundColor: pItem.color },
                    ]}
                  />
                </View>
                <Text style={[styles.colLabel, { color: theme.text }]}>{pItem.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
    marginVertical: 6,
  },
  statSub: {
    fontSize: 12,
  },
  breakdownBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  extraChartBox: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  barRow: {
    marginBottom: 14,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryStats: {
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  columnsChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 155,
    gap: 12,
    paddingTop: 8,
  },
  colItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  colPercent: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  colTrack: {
    width: 28,
    height: 115,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  colFill: {
    width: '100%',
    borderRadius: 8,
  },
  colLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
  },
});