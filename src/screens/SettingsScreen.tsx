import React from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTasks } from '../context/TaskContext';

export default function SettingsScreen() {
  const { theme, isDark, toggleDarkMode } = useAppTheme();
  const { lang, setLanguage, t } = useLanguage();
  const { clearAllTasks } = useTasks();

  const handleClearAll = () => {
    Alert.alert(t('clearAll'), '', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('clearAll'),
        style: 'destructive',
        onPress: async () => {
          await clearAllTasks();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>{t('settingsTab')}</Text>

      {/* الوضع الليلي */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.rowLeft}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={22}
            color={isDark ? '#F59E0B' : theme.primary}
          />
          <Text style={[styles.label, { color: theme.text }]}>{t('darkMode')}</Text>
        </View>
        <Switch value={isDark} onValueChange={toggleDarkMode} />
      </View>

      {/* اللغة والاتجاه */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.rowTop}>
          <Ionicons name="language" size={22} color={theme.primary} />
          <Text style={[styles.label, { color: theme.text }]}>{t('language')}</Text>
        </View>

        <View style={styles.langRow}>
          <TouchableOpacity
            style={[
              styles.langButton,
              {
                backgroundColor: lang === 'ar' ? theme.primary : theme.surface,
                borderColor: lang === 'ar' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setLanguage('ar')}
          >
            <Text style={{ color: lang === 'ar' ? '#FFFFFF' : theme.text, fontWeight: '700' }}>
              {t('arabic')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langButton,
              {
                backgroundColor: lang === 'en' ? theme.primary : theme.surface,
                borderColor: lang === 'en' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setLanguage('en')}
          >
            <Text style={{ color: lang === 'en' ? '#FFFFFF' : theme.text, fontWeight: '700' }}>
              {t('english')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* حذف جميع المهام */}
      <TouchableOpacity
        style={[styles.dangerCard, { backgroundColor: '#EF444415', borderColor: '#EF444455' }]}
        onPress={handleClearAll}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
        <Text style={styles.dangerText}>{t('clearAll')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  langRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  dangerText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});