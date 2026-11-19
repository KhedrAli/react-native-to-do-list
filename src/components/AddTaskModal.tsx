import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CategoryKey, PriorityLevel, RecurrenceType, TaskItem } from '../types/task';
import { buildMonthCalendarDays, parseDateKeyFromFormatted } from '../utils/dateFormat';
import { IconPickerModal } from './IconPickerModal';

const COLOR_SWATCHES = [
  '#2563EB',
  '#3B82F6',
  '#06B6D4',
  '#14B8A6',
  '#10B981',
  '#84CC16',
  '#F59E0B',
  '#F97316',
  '#EF4444',
  '#E11D48',
  '#EC4899',
  '#8B5CF6',
  '#6366F1',
  '#A855F7',
  '#0EA5E9',
  '#D97706',
];

const RECURRENCE_OPTIONS: RecurrenceType[] = ['always', 'specific', 'range', 'monthly'];
const PRIORITY_OPTIONS: PriorityLevel[] = ['low', 'medium', 'high'];

type CalendarTarget = 'specific' | 'startDate' | 'endDate' | null;

const MONTH_NAMES_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEK_HEADERS_AR = ['أح', 'إث', 'ثلا', 'أرب', 'خم', 'جم', 'سب'];
const WEEK_HEADERS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface AddTaskModalProps {
  visible: boolean;
  editingTask?: TaskItem | null;
  onClose: () => void;
  onSave: (task: Omit<TaskItem, 'id' | 'completed' | 'createdAt'>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<TaskItem>) => Promise<void>;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  editingTask,
  onClose,
  onSave,
  onUpdate,
}) => {
  const { allCategories, addCategory } = useTasks();
  const { theme } = useAppTheme();
  const { lang, t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryKey>('work');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('always');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [specificDateTime, setSpecificDateTime] = useState('');
  const [specificDateKey, setSpecificDateKey] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [icon, setIcon] = useState('briefcase');
  const [color, setColor] = useState('#3B82F6');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // حالة التقويم التفاعلي
  const now = new Date();
  const [calendarTarget, setCalendarTarget] = useState<CalendarTarget>(null);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // نافذة إضافة قسم جديد
  const [newCatModalOpen, setNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#14B8A6');
  const [newCatIcon, setNewCatIcon] = useState('folder');

  const calendarCells = useMemo(
    () => buildMonthCalendarDays(calYear, calMonth, lang),
    [calYear, calMonth, lang]
  );

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategory(editingTask.category);
      setRecurrence(editingTask.recurrence);
      setPriority(editingTask.priority);
      setSpecificDateTime(editingTask.specificDateTime || '');
      setSpecificDateKey(editingTask.specificDateKey);
      setStartDate(editingTask.startDate || '');
      setEndDate(editingTask.endDate || '');
      setDayOfMonth(editingTask.dayOfMonth ? String(editingTask.dayOfMonth) : '');
      setIcon(editingTask.icon);
      setColor(editingTask.color);
    } else {
      setTitle('');
      setDescription('');
      setCategory('work');
      setRecurrence('always');
      setPriority('medium');
      setSpecificDateTime('');
      setSpecificDateKey(undefined);
      setStartDate('');
      setEndDate('');
      setDayOfMonth('');
      setIcon('briefcase');
      setColor('#3B82F6');
    }
    setCalendarTarget(null);
  }, [editingTask, visible]);

  const showValidationAlert = (msgAr: string, msgEn: string) => {
    Alert.alert(
      lang === 'ar' ? 'تنبيه قبل الحفظ' : 'Validation Required',
      lang === 'ar' ? msgAr : msgEn
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showValidationAlert('يرجى كتابة عنوان المهمة أولاً.', 'Please enter a task title first.');
      return;
    }

    if (recurrence === 'specific') {
      if (!specificDateTime.trim()) {
        showValidationAlert(
          'يرجى اختيار التاريخ المحدد من التقويم أولاً.',
          'Please pick a specific date from the calendar first.'
        );
        return;
      }
    }

    if (recurrence === 'range') {
      if (!startDate.trim() || !endDate.trim()) {
        showValidationAlert(
          'يرجى تحديد تاريخ البداية وتاريخ النهاية من التقويم.',
          'Please pick both start date and end date from the calendar.'
        );
        return;
      }
      const startKey = parseDateKeyFromFormatted(startDate);
      const endKey = parseDateKeyFromFormatted(endDate);
      if (startKey && endKey && endKey < startKey) {
        showValidationAlert(
          'تاريخ النهاية يجب أن يكون مساوياً أو بعد تاريخ البداية.',
          'End date must be on or after the start date.'
        );
        return;
      }
    }

    let validDay: number | undefined = undefined;
    if (recurrence === 'monthly') {
      const trimmedDay = dayOfMonth.trim();
      const parsedDay = Number(trimmedDay);
      if (
        !trimmedDay ||
        !/^\d+$/.test(trimmedDay) ||
        Number.isNaN(parsedDay) ||
        parsedDay < 1 ||
        parsedDay > 31
      ) {
        showValidationAlert(
          'يرجى إدخال يوم صحيح من الشهر بين 1 و 31 فقط.',
          'Please enter a valid day of the month between 1 and 31 only.'
        );
        return;
      }
      validDay = parsedDay;
    }

    const payload: Omit<TaskItem, 'id' | 'completed' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      recurrence,
      priority,
      specificDateTime:
        recurrence === 'specific' ? specificDateTime.trim() : undefined,
      specificDateKey: recurrence === 'specific' ? specificDateKey : undefined,
      startDate: recurrence === 'range' ? startDate.trim() : undefined,
      endDate: recurrence === 'range' ? endDate.trim() : undefined,
      dayOfMonth: validDay,
      icon,
      color,
    };

    if (editingTask && onUpdate) {
      await onUpdate(editingTask.id, payload);
    } else {
      await onSave(payload);
    }

    onClose();
  };

  const openCalendarFor = (target: CalendarTarget) => {
    if (calendarTarget === target) {
      setCalendarTarget(null);
      return;
    }
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
    setCalendarTarget(target);
  };

  const handlePickCalendarDay = (formatted: string, dateKey: string) => {
    if (calendarTarget === 'specific') {
      setSpecificDateTime(formatted);
      setSpecificDateKey(dateKey);
    } else if (calendarTarget === 'startDate') {
      setStartDate(formatted);
    } else if (calendarTarget === 'endDate') {
      setEndDate(formatted);
    }
    setCalendarTarget(null);
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(calYear, calMonth + delta, 1);
    setCalYear(next.getFullYear());
    setCalMonth(next.getMonth());
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      showValidationAlert('يرجى إدخال اسم القسم الجديد.', 'Please enter a category name.');
      return;
    }
    const created = await addCategory({
      labelAr: newCatName.trim(),
      labelEn: newCatName.trim(),
      defaultColor: newCatColor,
      defaultIcon: newCatIcon,
    });
    setCategory(created.key);
    setColor(created.defaultColor);
    setIcon(created.defaultIcon);
    setNewCatName('');
    setNewCatModalOpen(false);
  };

  const renderCalendarGrid = () => {
    if (!calendarTarget) return null;
    const weekHeaders = lang === 'ar' ? WEEK_HEADERS_AR : WEEK_HEADERS_EN;
    const monthLabel =
      lang === 'ar' ? `${MONTH_NAMES_AR[calMonth]} ${calYear}` : `${MONTH_NAMES_EN[calMonth]} ${calYear}`;

    return (
      <View style={[styles.calendarBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.calNavBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.calMonthTitle, { color: theme.text }]}>{monthLabel}</Text>
          <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.calNavBtn}>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekHeaderRow}>
          {weekHeaders.map((wh) => (
            <Text key={wh} style={[styles.weekHeaderCell, { color: theme.mutedText }]}>
              {wh}
            </Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {calendarCells.map((cell) => {
            if (!cell.dayNumber || !cell.formatted || !cell.dateKey) {
              return <View key={cell.key} style={styles.dayCellEmpty} />;
            }

            const isCurrentPicked =
              (calendarTarget === 'specific' && specificDateTime === cell.formatted) ||
              (calendarTarget === 'startDate' && startDate === cell.formatted) ||
              (calendarTarget === 'endDate' && endDate === cell.formatted);

            return (
              <TouchableOpacity
                key={cell.key}
                style={[
                  styles.dayCell,
                  isCurrentPicked && { backgroundColor: theme.primary },
                ]}
                onPress={() => handlePickCalendarDay(cell.formatted!, cell.dateKey!)}
              >
                <Text
                  style={[
                    styles.dayCellText,
                    { color: isCurrentPicked ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {cell.dayNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.heading, { color: theme.text }]}>
              {editingTask
                ? lang === 'ar'
                  ? 'تعديل المهمة'
                  : 'Edit Task'
                : t('addTask')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color={theme.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('titlePlaceholder')}
            placeholderTextColor={theme.mutedText}
            style={[
              styles.input,
              { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
            ]}
          />

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('descriptionPlaceholder')}
            placeholderTextColor={theme.mutedText}
            multiline
            numberOfLines={3}
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
            ]}
          />

          {/* 1. التصنيف + زر إضافة قسم جديد */}
          <View style={styles.rowBetween}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>{t('categoryLabel')}</Text>
            <TouchableOpacity
              style={[
                styles.addCatBtn,
                { backgroundColor: `${theme.primary}18`, borderColor: theme.primary },
              ]}
              onPress={() => setNewCatModalOpen(true)}
            >
              <Ionicons name="add" size={16} color={theme.primary} />
              <Text style={[styles.addCatText, { color: theme.primary }]}>
                {lang === 'ar' ? 'قسم جديد' : 'New Category'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipWrap}>
            {allCategories.map((cat) => {
              const active = category === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.chip,
                    {
                      borderColor: cat.defaultColor,
                      backgroundColor: active ? cat.defaultColor : theme.card,
                    },
                  ]}
                  onPress={() => {
                    setCategory(cat.key);
                    setColor(cat.defaultColor);
                    setIcon(cat.defaultIcon);
                  }}
                >
                  <Text style={{ color: active ? '#FFFFFF' : theme.text, fontWeight: '600' }}>
                    {lang === 'ar' ? cat.labelAr : cat.labelEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 2. وقت التكرار والتقويم */}
          <Text style={[styles.sectionLabel, { color: theme.text }]}>{t('recurrenceLabel')}</Text>
          <View style={styles.chipWrap}>
            {RECURRENCE_OPTIONS.map((rec) => {
              const active = recurrence === rec;
              return (
                <TouchableOpacity
                  key={rec}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? theme.primary : theme.border,
                      backgroundColor: active ? theme.primary : theme.card,
                    },
                  ]}
                  onPress={() => {
                    setRecurrence(rec);
                    setCalendarTarget(null);
                  }}
                >
                  <Text style={{ color: active ? '#FFFFFF' : theme.text, fontWeight: '600' }}>
                    {t(rec)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {recurrence === 'specific' && (
            <View style={styles.subBox}>
              <TouchableOpacity
                style={[
                  styles.datePickerTrigger,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() => openCalendarFor('specific')}
              >
                <Ionicons name="calendar" size={20} color={theme.primary} />
                <Text
                  style={[
                    styles.dateTriggerText,
                    { color: specificDateTime ? theme.text : theme.mutedText },
                  ]}
                >
                  {specificDateTime ||
                    (lang === 'ar'
                      ? 'اختر التاريخ من الكالندر (مثال: 20/05/2025 الاثنين)'
                      : 'Pick date from calendar (e.g. 20/05/2025 Monday)')}
                </Text>
                <Ionicons
                  name={calendarTarget === 'specific' ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.mutedText}
                />
              </TouchableOpacity>
              {calendarTarget === 'specific' && renderCalendarGrid()}
            </View>
          )}

          {recurrence === 'range' && (
            <View style={styles.subBox}>
              <View style={styles.rangeRow}>
                <TouchableOpacity
                  style={[
                    styles.datePickerTrigger,
                    styles.halfInput,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                  onPress={() => openCalendarFor('startDate')}
                >
                  <Ionicons name="calendar-outline" size={18} color={theme.primary} />
                  <Text
                    style={[
                      styles.dateTriggerText,
                      { color: startDate ? theme.text : theme.mutedText },
                    ]}
                    numberOfLines={1}
                  >
                    {startDate || (lang === 'ar' ? 'تاريخ البداية' : 'Start Date')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.datePickerTrigger,
                    styles.halfInput,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                  onPress={() => openCalendarFor('endDate')}
                >
                  <Ionicons name="calendar-outline" size={18} color="#10B981" />
                  <Text
                    style={[
                      styles.dateTriggerText,
                      { color: endDate ? theme.text : theme.mutedText },
                    ]}
                    numberOfLines={1}
                  >
                    {endDate || (lang === 'ar' ? 'تاريخ النهاية' : 'End Date')}
                  </Text>
                </TouchableOpacity>
              </View>

              {(calendarTarget === 'startDate' || calendarTarget === 'endDate') &&
                renderCalendarGrid()}
            </View>
          )}

          {recurrence === 'monthly' && (
            <TextInput
              value={dayOfMonth}
              onChangeText={setDayOfMonth}
              placeholder={
                lang === 'ar' ? 'أدخل رقم اليوم من 1 إلى 31 فقط' : 'Enter day of month (1 to 31 only)'
              }
              placeholderTextColor={theme.mutedText}
              keyboardType="number-pad"
              maxLength={2}
              style={[
                styles.input,
                styles.subInput,
                { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
              ]}
            />
          )}

          {/* 3. الأولوية */}
          <Text style={[styles.sectionLabel, { color: theme.text }]}>{t('priorityLabel')}</Text>
          <View style={styles.chipWrap}>
            {PRIORITY_OPTIONS.map((p) => {
              const active = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? theme.primary : theme.border,
                      backgroundColor: active ? theme.primary : theme.card,
                    },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={{ color: active ? '#FFFFFF' : theme.text, fontWeight: '600' }}>
                    {t(p)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 4. الأيقونة الملونة */}
          <Text style={[styles.sectionLabel, { color: theme.text }]}>{t('iconLabel')}</Text>
          <TouchableOpacity
            style={[styles.iconSelector, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setIconPickerOpen(true)}
          >
            <View style={[styles.previewCircle, { backgroundColor: `${color}22` }]}>
              <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <Text style={[styles.iconNameText, { color: theme.text }]}>{icon}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.mutedText} />
          </TouchableOpacity>

          {/* 5. لون البطاقة */}
          <Text style={[styles.sectionLabel, { color: theme.text }]}>{t('colorLabel')}</Text>
          <View style={styles.colorRow}>
            {COLOR_SWATCHES.map((swatch) => {
              const selected = color === swatch;
              return (
                <TouchableOpacity
                  key={swatch}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: swatch,
                      borderWidth: selected ? 3 : 0,
                      borderColor: theme.text,
                    },
                  ]}
                  onPress={() => setColor(swatch)}
                />
              );
            })}
          </View>

          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.btnText, { color: theme.text }]}>{t('cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.btnText, { color: '#FFFFFF' }]}>{t('save')}</Text>
            </TouchableOpacity>
          </View>

          <IconPickerModal
            visible={iconPickerOpen}
            selectedIcon={icon}
            accentColor={color}
            onSelect={(pickedIcon, suggestedColor) => {
              setIcon(pickedIcon);
              if (suggestedColor) setColor(suggestedColor);
            }}
            onClose={() => setIconPickerOpen(false)}
          />

          {/* نافذة إضافة قسم جديد */}
          <Modal
            visible={newCatModalOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setNewCatModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.catDialog,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.dialogTitle, { color: theme.text }]}>
                  {lang === 'ar' ? 'إضافة قسم جديد' : 'Add New Category'}
                </Text>

                <TextInput
                  value={newCatName}
                  onChangeText={setNewCatName}
                  placeholder={lang === 'ar' ? 'اسم القسم...' : 'Category name...'}
                  placeholderTextColor={theme.mutedText}
                  style={[
                    styles.input,
                    { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                  ]}
                />

                <View style={styles.colorRow}>
                  {COLOR_SWATCHES.map((swatch) => (
                    <TouchableOpacity
                      key={swatch}
                      style={[
                        styles.colorCircle,
                        {
                          backgroundColor: swatch,
                          borderWidth: newCatColor === swatch ? 3 : 0,
                          borderColor: theme.text,
                        },
                      ]}
                      onPress={() => setNewCatColor(swatch)}
                    />
                  ))}
                </View>

                <View style={styles.footerButtons}>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: theme.card }]}
                    onPress={() => setNewCatModalOpen(false)}
                  >
                    <Text style={[styles.btnText, { color: theme.text }]}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: theme.primary }]}
                    onPress={handleCreateCategory}
                  >
                    <Text style={[styles.btnText, { color: '#FFFFFF' }]}>{t('save')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 10,
  },
  addCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  addCatText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subInput: {
    marginTop: 8,
  },
  subBox: {
    marginTop: 6,
    marginBottom: 8,
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  dateTriggerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  calendarBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calMonthTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  calNavBtn: {
    padding: 6,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  dayCellEmpty: {
    width: '14.2857%',
    aspectRatio: 1,
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  previewCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconNameText: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  catDialog: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
});