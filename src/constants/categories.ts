import { CategoryKey } from '../types/task';

export interface CategoryMeta {
  key: CategoryKey;
  labelAr: string;
  labelEn: string;
  defaultColor: string;
  defaultIcon: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: 'mental', labelAr: 'صحة نفسية', labelEn: 'Mental Health', defaultColor: '#8B5CF6', defaultIcon: 'happy' },
  { key: 'athletic', labelAr: 'صحة رياضية', labelEn: 'Athletic', defaultColor: '#10B981', defaultIcon: 'barbell' },
  { key: 'physical', labelAr: 'صحة جسدية', labelEn: 'Physical Health', defaultColor: '#06B6D4', defaultIcon: 'heart' },
  { key: 'performance', labelAr: 'مهمة أداء', labelEn: 'Performance', defaultColor: '#F59E0B', defaultIcon: 'rocket' },
  { key: 'chores', labelAr: 'أشغال', labelEn: 'Chores', defaultColor: '#EC4899', defaultIcon: 'home' },
  { key: 'work', labelAr: 'عمل', labelEn: 'Work', defaultColor: '#3B82F6', defaultIcon: 'briefcase' },
];