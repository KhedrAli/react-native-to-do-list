import { TaskItem } from '../types/task';
import { parseDateKeyFromFormatted, toDateKey } from './dateFormat';

export function isTaskActiveOnDate(task: TaskItem, targetDate: Date = new Date()): boolean {
  const targetKey = toDateKey(targetDate);

  switch (task.recurrence) {
    case 'always':
      return true;

    case 'specific': {
      const key = task.specificDateKey || parseDateKeyFromFormatted(task.specificDateTime);
      if (!key) return true;
      return key === targetKey;
    }

    case 'range': {
      const startKey = parseDateKeyFromFormatted(task.startDate);
      const endKey = parseDateKeyFromFormatted(task.endDate);
      if (!startKey || !endKey) return true;
      return targetKey >= startKey && targetKey <= endKey;
    }

    case 'monthly': {
      if (!task.dayOfMonth) return true;
      return targetDate.getDate() === Number(task.dayOfMonth);
    }

    default:
      return true;
  }
}