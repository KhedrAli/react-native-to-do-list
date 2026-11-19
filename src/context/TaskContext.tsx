import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CATEGORIES } from '../constants/categories';
import { CategoryDefinition, TaskItem } from '../types/task';
import { toDateKey } from '../utils/dateFormat';
import { isTaskActiveOnDate } from '../utils/recurrence';
import {
  loadCustomCategories,
  loadLastResetDay,
  loadTasksFromStorage,
  saveCustomCategories,
  saveLastResetDay,
  saveTasksToStorage,
} from '../utils/storage';

export interface CategoryBreakdownItem {
  key: string;
  labelAr: string;
  labelEn: string;
  color: string;
  count: number;
  percentage: number;
}

interface TaskContextValue {
  tasks: TaskItem[];
  allCategories: CategoryDefinition[];
  todayTasks: TaskItem[];
  completionRate: number;
  categoryBreakdown: CategoryBreakdownItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'completed' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<TaskItem>) => Promise<void>;
  quickAddFromTemplate: (template: TaskItem) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearAllTasks: () => Promise<void>;
  addCategory: (cat: {
    labelAr: string;
    labelEn?: string;
    defaultColor: string;
    defaultIcon: string;
  }) => Promise<CategoryDefinition>;
}

const TaskContext = createContext<TaskContextValue>({
  tasks: [],
  allCategories: CATEGORIES,
  todayTasks: [],
  completionRate: 0,
  categoryBreakdown: [],
  addTask: async () => {},
  updateTask: async () => {},
  quickAddFromTemplate: async () => {},
  toggleTask: async () => {},
  deleteTask: async () => {},
  clearAllTasks: async () => {},
  addCategory: async () => CATEGORIES[0],
});

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [customCategories, setCustomCategories] = useState<CategoryDefinition[]>([]);

  useEffect(() => {
    const init = async () => {
      const [loadedTasks, loadedCats, lastResetDay] = await Promise.all([
        loadTasksFromStorage(),
        loadCustomCategories(),
        loadLastResetDay(),
      ]);

      setCustomCategories(loadedCats);

      const todayKey = toDateKey(new Date());
      if (lastResetDay && lastResetDay !== todayKey) {
        // بداية يوم جديد: إعادة تعيين حالة الإنجاز للمهام المتكررة
        const resetTasks = loadedTasks.map((t) =>
          t.recurrence === 'always' || t.recurrence === 'range' || t.recurrence === 'monthly'
            ? { ...t, completed: false }
            : t
        );
        setTasks(resetTasks);
        await saveTasksToStorage(resetTasks);
      } else {
        setTasks(loadedTasks);
      }

      if (lastResetDay !== todayKey) {
        await saveLastResetDay(todayKey);
      }
    };

    init();
  }, []);

  const persistTasks = async (next: TaskItem[]) => {
    setTasks(next);
    await saveTasksToStorage(next);
  };

  const addTask = async (input: Omit<TaskItem, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...input,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    await persistTasks([newTask, ...tasks]);
  };

  const updateTask = async (id: string, updates: Partial<TaskItem>) => {
    const next = tasks.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      return {
        ...updated,
        lastCompletedDateKey: updated.completed ? toDateKey(new Date()) : undefined,
      };
    });
    await persistTasks(next);
  };

  const quickAddFromTemplate = async (template: TaskItem) => {
    const cloned: TaskItem = {
      ...template,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      completed: false,
      lastCompletedDateKey: undefined,
      createdAt: new Date().toISOString(),
    };
    await persistTasks([cloned, ...tasks]);
  };

  const toggleTask = async (id: string) => {
    const todayKey = toDateKey(new Date());
    const next = tasks.map((item) => {
      if (item.id !== id) return item;
      const nextCompleted = !item.completed;
      return {
        ...item,
        completed: nextCompleted,
        lastCompletedDateKey: nextCompleted ? todayKey : undefined,
      };
    });
    await persistTasks(next);
  };

  const deleteTask = async (id: string) => {
    await persistTasks(tasks.filter((item) => item.id !== id));
  };

  const clearAllTasks = async () => {
    await persistTasks([]);
  };

  const addCategory = async (cat: {
    labelAr: string;
    labelEn?: string;
    defaultColor: string;
    defaultIcon: string;
  }): Promise<CategoryDefinition> => {
    const cleanAr = cat.labelAr.trim();
    const cleanEn = (cat.labelEn || cat.labelAr).trim();
    const newCat: CategoryDefinition = {
      key: `custom_${Date.now()}`,
      labelAr: cleanAr,
      labelEn: cleanEn,
      defaultColor: cat.defaultColor,
      defaultIcon: cat.defaultIcon,
      isCustom: true,
    };
    const nextCats = [...customCategories, newCat];
    setCustomCategories(nextCats);
    await saveCustomCategories(nextCats);
    return newCat;
  };

  const allCategories = useMemo<CategoryDefinition[]>(
    () => [...CATEGORIES, ...customCategories],
    [customCategories]
  );

  const todayTasks = useMemo(
    () => tasks.filter((item) => isTaskActiveOnDate(item, new Date())),
    [tasks]
  );

  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    const doneCount = tasks.filter((item) => item.completed).length;
    return Math.round((doneCount / tasks.length) * 100);
  }, [tasks]);

  const categoryBreakdown = useMemo<CategoryBreakdownItem[]>(() => {
    const total = tasks.length;
    return allCategories.map((cat) => {
      const count = tasks.filter((item) => item.category === cat.key).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        key: cat.key,
        labelAr: cat.labelAr,
        labelEn: cat.labelEn,
        color: cat.defaultColor,
        count,
        percentage,
      };
    });
  }, [tasks, allCategories]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        allCategories,
        todayTasks,
        completionRate,
        categoryBreakdown,
        addTask,
        updateTask,
        quickAddFromTemplate,
        toggleTask,
        deleteTask,
        clearAllTasks,
        addCategory,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);