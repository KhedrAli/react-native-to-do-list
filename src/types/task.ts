export type BuiltInCategoryKey =
  | 'mental'
  | 'athletic'
  | 'physical'
  | 'performance'
  | 'chores'
  | 'work';

export type CategoryKey = BuiltInCategoryKey | string;

export type RecurrenceType = 'always' | 'specific' | 'range' | 'monthly';

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface CategoryDefinition {
  key: string;
  labelAr: string;
  labelEn: string;
  defaultColor: string;
  defaultIcon: string;
  isCustom?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  category: CategoryKey;
  recurrence: RecurrenceType;
  priority: PriorityLevel;
  specificDateTime?: string; // مثال: 2025/05/20 الاثنين 18:00
  specificDateKey?: string;  // مفتاح تاريخ للمقارنة: YYYY-MM-DD
  startDate?: string;        // YYYY-MM-DD
  endDate?: string;          // YYYY-MM-DD
  dayOfMonth?: number;       // 1 - 31
  icon: string;
  color: string;
  completed: boolean;
  lastCompletedDateKey?: string; // YYYY-MM-DD
  createdAt: string;
}