import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryDefinition, TaskItem } from '../types/task';

const TASKS_KEY = '@ToDoList99:tasks';
const CUSTOM_CATS_KEY = '@ToDoList99:customCategories';
const LAST_RESET_DAY_KEY = '@ToDoList99:lastResetDay';
const THEME_KEY = '@ToDoList99:darkMode';
const LANG_KEY = '@ToDoList99:lang';

export async function saveTasksToStorage(tasks: TaskItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

export async function loadTasksFromStorage(): Promise<TaskItem[]> {
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    return raw ? (JSON.parse(raw) as TaskItem[]) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

export async function saveCustomCategories(cats: CategoryDefinition[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CUSTOM_CATS_KEY, JSON.stringify(cats));
  } catch (error) {
    console.error('Error saving custom categories:', error);
  }
}

export async function loadCustomCategories(): Promise<CategoryDefinition[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_CATS_KEY);
    return raw ? (JSON.parse(raw) as CategoryDefinition[]) : [];
  } catch (error) {
    console.error('Error loading custom categories:', error);
    return [];
  }
}

export async function loadLastResetDay(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_RESET_DAY_KEY);
  } catch {
    return null;
  }
}

export async function saveLastResetDay(dayKey: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_RESET_DAY_KEY, dayKey);
  } catch (error) {
    console.error('Error saving last reset day:', error);
  }
}

export async function saveDarkModePreference(isDark: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, JSON.stringify(isDark));
  } catch (error) {
    console.error('Error saving theme preference:', error);
  }
}

export async function loadDarkModePreference(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(THEME_KEY);
    return raw ? Boolean(JSON.parse(raw)) : false;
  } catch (error) {
    console.error('Error loading theme preference:', error);
    return false;
  }
}

export async function saveLanguagePreference(lang: 'ar' | 'en'): Promise<void> {
  try {
    await AsyncStorage.setItem(LANG_KEY, lang);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
}

export async function loadLanguagePreference(): Promise<'ar' | 'en'> {
  try {
    const raw = await AsyncStorage.getItem(LANG_KEY);
    return raw === 'en' ? 'en' : 'ar';
  } catch (error) {
    console.error('Error loading language preference:', error);
    return 'ar';
  }
}