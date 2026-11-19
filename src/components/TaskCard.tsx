import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { TaskItem } from '../types/task';

interface TaskCardProps {
  task: TaskItem;
  onToggle: () => void;
  onLongPress: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onLongPress,
  onDelete,
}) => {
  const { allCategories } = useTasks();
  const { theme } = useAppTheme();
  const { lang, t } = useLanguage();

  const categoryMeta = allCategories.find((c) => c.key === task.category);
  const categoryLabel = categoryMeta
    ? lang === 'ar'
      ? categoryMeta.labelAr
      : categoryMeta.labelEn
    : task.category;

  const priorityColor =
    task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#F59E0B' : '#10B981';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderLeftWidth: 4,
          borderLeftColor: task.color,
        },
      ]}
      onPress={onToggle}
      onLongPress={onLongPress}
      delayLongPress={320}
      activeOpacity={0.78}
    >
      <View style={styles.mainContent}>
        <View style={[styles.iconBox, { backgroundColor: `${task.color}22` }]}>
          <Ionicons name={task.icon as any} size={24} color={task.color} />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text
              style={[
                styles.title,
                { color: theme.text },
                task.completed && styles.completedTitle,
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}20` }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>{t(task.priority)}</Text>
            </View>
          </View>

          {!!task.description && (
            <Text style={[styles.desc, { color: theme.mutedText }]} numberOfLines={2}>
              {task.description}
            </Text>
          )}

          <View style={styles.metaRow}>
            <Text style={[styles.metaTag, { color: task.color }]}>{categoryLabel}</Text>
            <Text style={[styles.metaDot, { color: theme.mutedText }]}>•</Text>
            <Text style={[styles.metaTag, { color: theme.mutedText }]}>{t(task.recurrence)}</Text>
            {task.recurrence === 'specific' && task.specificDateTime ? (
              <Text style={[styles.metaTag, { color: theme.mutedText }]}>
                ({task.specificDateTime})
              </Text>
            ) : null}
            {task.recurrence === 'monthly' && task.dayOfMonth ? (
              <Text style={[styles.metaTag, { color: theme.mutedText }]}> ({task.dayOfMonth})</Text>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={task.completed ? 'checkbox' : 'square-outline'}
            size={24}
            color={task.completed ? '#10B981' : theme.mutedText}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 10,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.55,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 4,
  },
  metaTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaDot: {
    fontSize: 12,
  },
  actions: {
    alignItems: 'center',
    gap: 12,
  },
});