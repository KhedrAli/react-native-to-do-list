export interface AppTheme {
  dark: boolean;
  background: string;
  surface: string;
  card: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
}

export const LIGHT_THEME: AppTheme = {
  dark: false,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  mutedText: '#64748B',
  border: '#E2E8F0',
  primary: '#2563EB',
};

export const DARK_THEME: AppTheme = {
  dark: true,
  background: '#0B1120',
  surface: '#111827',
  card: '#1E293B',
  text: '#F8FAFC',
  mutedText: '#94A3B8',
  border: '#334155',
  primary: '#3B82F6',
};