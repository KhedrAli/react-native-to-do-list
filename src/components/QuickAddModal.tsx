import React, { useMemo } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { TaskItem } from '../types/task';

interface QuickAddModalProps {
  visible: boolean;
  tasks: TaskItem[];
  onSelectTemplate: (task: TaskItem) => Promise<void>;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  visible,
  tasks,
  onSelectTemplate,
  onClose,
}) => {
  const { theme } = useAppTheme();
  const { lang } = useLanguage();

  const uniqueTemplates = useMemo(() => {
    const seen = new Set<string>();
    const list: TaskItem[] = [];
    for (const item of tasks) {
      const key = item.title.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(item);
      }
    }
    return list;
  }, [tasks]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {lang === 'ar' ? 'إضافة سريعة من المهام السابقة' : 'Quick Add from Saved Tasks'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color={theme.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={uniqueTemplates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="flash-outline" size={40} color={theme.mutedText} />
              <Text style={[styles.emptyText, { color: theme.mutedText }]}>
                {lang === 'ar'
                  ? 'لا توجد مهام سابقة بعد. أضف مهمة أولاً ليظهر هنا.'
                  : 'No previous tasks yet. Create a task first.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={async () => {
                await onSelectTemplate(item);
                onClose();
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: `${item.color}22` }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                {!!item.description && (
                  <Text style={[styles.itemDesc, { color: theme.mutedText }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
              </View>
              <Ionicons name="add-circle" size={26} color={theme.primary} />
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});