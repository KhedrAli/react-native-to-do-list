import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTasks } from '../context/TaskContext';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CategoryKey, TaskItem } from '../types/task';
import { computeSafeLayoutMetrics } from '../utils/safeAreaGuard';
import { TaskCard } from '../components/TaskCard';
import { AddTaskModal } from '../components/AddTaskModal';
import { QuickAddModal } from '../components/QuickAddModal';

type FilterOption = 'all' | CategoryKey;

export default function TasksScreen() {
  const {
    tasks,
    allCategories,
    addTask,
    updateTask,
    quickAddFromTemplate,
    toggleTask,
    deleteTask,
  } = useTasks();
  const { theme } = useAppTheme();
  const { lang, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const metrics = computeSafeLayoutMetrics(insets);

  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [completedSectionExpanded, setCompletedSectionExpanded] = useState(true);

  // التحكم بإخفاء الأزرار أثناء السحب وإظهارها عند التوقف
  const fabAnim = useRef(new Animated.Value(1)).current;

  const setFabsVisible = (visible: boolean) => {
    Animated.timing(fabAnim, {
      toValue: visible ? 1 : 0,
      duration: 170,
      useNativeDriver: true,
    }).start();
  };

  const fabAnimatedStyle = {
    opacity: fabAnim,
    transform: [
      {
        translateY: fabAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [28, 0],
        }),
      },
      {
        scale: fabAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.88, 1],
        }),
      },
    ],
  };

  const mainFabBottom = Math.max(12, metrics.bottomInset + 8);
  const quickFabBottom = mainFabBottom + 60;

  const filteredTasks = useMemo(() => {
    if (selectedFilter === 'all') return tasks;
    return tasks.filter((item) => item.category === selectedFilter);
  }, [tasks, selectedFilter]);

  const uncompletedTasks = useMemo(
    () => filteredTasks.filter((item) => !item.completed),
    [filteredTasks]
  );

  const completedTasks = useMemo(
    () => filteredTasks.filter((item) => item.completed),
    [filteredTasks]
  );

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const openNewModal = () => {
    setEditingTask(null);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>{t('appName')}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            {
              backgroundColor: selectedFilter === 'all' ? theme.primary : theme.card,
              borderColor: selectedFilter === 'all' ? theme.primary : theme.border,
            },
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              { color: selectedFilter === 'all' ? '#FFFFFF' : theme.text },
            ]}
          >
            {t('all')} ({tasks.length})
          </Text>
        </TouchableOpacity>

        {allCategories.map((cat) => {
          const active = selectedFilter === cat.key;
          const count = tasks.filter((item) => item.category === cat.key).length;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? cat.defaultColor : theme.card,
                  borderColor: active ? cat.defaultColor : theme.border,
                },
              ]}
              onPress={() => setSelectedFilter(cat.key)}
            >
              <Text style={[styles.filterText, { color: active ? '#FFFFFF' : theme.text }]}>
                {lang === 'ar' ? cat.labelAr : cat.labelEn} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: mainFabBottom + 120 },
        ]}
        onScrollBeginDrag={() => setFabsVisible(false)}
        onScrollEndDrag={() => setFabsVisible(true)}
        onMomentumScrollEnd={() => setFabsVisible(true)}
        scrollEventThrottle={16}
      >
        {/* القسم الأول: المهام غير المنجزة */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Ionicons name="time-outline" size={18} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {lang === 'ar' ? 'المهام غير المنجزة' : 'Uncompleted Tasks'}
            </Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: `${theme.primary}20` }]}>
            <Text style={[styles.badgePillText, { color: theme.primary }]}>
              {uncompletedTasks.length}
            </Text>
          </View>
        </View>

        {uncompletedTasks.length > 0 ? (
          uncompletedTasks.map((item) => (
            <TaskCard
              key={item.id}
              task={item}
              onToggle={() => toggleTask(item.id)}
              onLongPress={() => openEditModal(item)}
              onDelete={() => deleteTask(item.id)}
            />
          ))
        ) : (
          <View style={[styles.emptySectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="checkmark-done-circle-outline" size={28} color="#10B981" />
            <Text style={[styles.emptySectionText, { color: theme.mutedText }]}>
              {lang === 'ar'
                ? 'لا توجد مهام غير منجزة حالياً'
                : 'No uncompleted tasks right now'}
            </Text>
          </View>
        )}

        {/* القسم الثاني: المهام المنجزة */}
        <TouchableOpacity
          style={[styles.sectionHeaderRow, styles.completedSectionHeader]}
          onPress={() => setCompletedSectionExpanded((prev) => !prev)}
          activeOpacity={0.75}
        >
          <View style={styles.sectionTitleGroup}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {lang === 'ar' ? 'المهام المنجزة' : 'Completed Tasks'}
            </Text>
          </View>

          <View style={styles.rightSectionMeta}>
            <View style={[styles.badgePill, { backgroundColor: '#10B98122' }]}>
              <Text style={[styles.badgePillText, { color: '#10B981' }]}>
                {completedTasks.length}
              </Text>
            </View>
            <Ionicons
              name={completedSectionExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.mutedText}
            />
          </View>
        </TouchableOpacity>

        {completedSectionExpanded &&
          (completedTasks.length > 0 ? (
            completedTasks.map((item) => (
              <TaskCard
                key={item.id}
                task={item}
                onToggle={() => toggleTask(item.id)}
                onLongPress={() => openEditModal(item)}
                onDelete={() => deleteTask(item.id)}
              />
            ))
          ) : (
            <View style={[styles.emptySectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.emptySectionText, { color: theme.mutedText }]}>
                {lang === 'ar' ? 'لم يتم إنجاز أي مهمة بعد' : 'No completed tasks yet'}
              </Text>
            </View>
          ))}
      </ScrollView>

      {/* زر الإضافة السريعة */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.fabAnchor,
          { bottom: quickFabBottom },
          fabAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.quickFab,
            {
              backgroundColor: theme.card,
              borderColor: theme.primary,
            },
          ]}
          onPress={() => setQuickAddVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="flash" size={22} color={theme.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* زر الإضافة الرئيسي في الأسفل */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.fabAnchor,
          { bottom: mainFabBottom },
          fabAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: theme.primary,
            },
          ]}
          onPress={openNewModal}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <AddTaskModal
        visible={modalVisible}
        editingTask={editingTask}
        onClose={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
        onSave={addTask}
        onUpdate={updateTask}
      />

      <QuickAddModal
        visible={quickAddVisible}
        tasks={tasks}
        onSelectTemplate={quickAddFromTemplate}
        onClose={() => setQuickAddVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterBar: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 10,
  },
  completedSectionHeader: {
    marginTop: 16,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  rightSectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptySectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  emptySectionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fabAnchor: {
    position: 'absolute',
    right: 20,
  },
  quickFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    alignSelf: 'center',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});