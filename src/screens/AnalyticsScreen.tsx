import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTasks } from '../context/TaskContext';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { computeSafeLayoutMetrics } from '../utils/safeAreaGuard';
import { StatCharts } from '../components/StatCharts';

export default function AnalyticsScreen() {
  const { tasks, todayTasks, completionRate, categoryBreakdown } = useTasks();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const metrics = computeSafeLayoutMetrics(insets);

  const completedCount = tasks.filter((item) => item.completed).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: metrics.fabBottomOffset + 12 },
      ]}
    >
      <Text style={[styles.heading, { color: theme.text }]}>{t('analyticsTab')}</Text>

      <StatCharts
        tasks={tasks}
        totalTasks={tasks.length}
        completedTasks={completedCount}
        todayActiveCount={todayTasks.length}
        completionRate={completionRate}
        breakdown={categoryBreakdown}
      />
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
    marginBottom: 16,
  },
});