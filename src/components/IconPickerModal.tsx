import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TASK_ICONS } from '../constants/icons';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const VIBRANT_ICON_COLORS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#E11D48',
  '#84CC16',
];

interface IconPickerModalProps {
  visible: boolean;
  selectedIcon: string;
  accentColor: string;
  onSelect: (iconName: string, suggestedColor?: string) => void;
  onClose: () => void;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  visible,
  selectedIcon,
  accentColor,
  onSelect,
  onClose,
}) => {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  const filteredIcons = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return TASK_ICONS;
    return TASK_ICONS.filter((iconName) => iconName.toLowerCase().includes(cleanQuery));
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {t('iconLabel')} ({filteredIcons.length})
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={26} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Ionicons name="search" size={20} color={theme.mutedText} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('searchIcons')}
            placeholderTextColor={theme.mutedText}
            style={[styles.searchInput, { color: theme.text }]}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.mutedText} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredIcons}
          keyExtractor={(item, index) => `${item}-${index}`}
          numColumns={6}
          initialNumToRender={60}
          maxToRenderPerBatch={60}
          windowSize={7}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item, index }) => {
            const isSelected = item === selectedIcon;
            const livelyColor = VIBRANT_ICON_COLORS[index % VIBRANT_ICON_COLORS.length];
            return (
              <TouchableOpacity
                style={[
                  styles.iconCell,
                  {
                    backgroundColor: `${livelyColor}16`,
                    borderColor: isSelected ? accentColor : `${livelyColor}44`,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  onSelect(item, livelyColor);
                  setQuery('');
                  onClose();
                }}
              >
                <Ionicons name={item as any} size={24} color={livelyColor} />
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 28,
  },
  iconCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 3,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});