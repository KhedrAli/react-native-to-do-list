import { EdgeInsets } from 'react-native-safe-area-context';

export interface LayoutGuardMetrics {
  bottomInset: number;
  topInset: number;
  hasBottomSystemBar: boolean;
  tabBarHeight: number;
  tabBarBottomPadding: number;
  fabBottomOffset: number;
}

export function computeSafeLayoutMetrics(insets: EdgeInsets): LayoutGuardMetrics {
  const bottomInset = Math.max(0, insets.bottom);
  const topInset = Math.max(0, insets.top);
  const hasBottomSystemBar = bottomInset > 0;

  const baseTabHeight = 52;
  const tabBarBottomPadding = hasBottomSystemBar ? bottomInset + 4 : 6;
  const tabBarHeight = baseTabHeight + tabBarBottomPadding + 4;
  // إنزال الأزرار قليلاً إلى الأسفل لتصبح أقرب وأكثر توازناً
  const fabBottomOffset = tabBarHeight + 6;

  return {
    bottomInset,
    topInset,
    hasBottomSystemBar,
    tabBarHeight,
    tabBarBottomPadding,
    fabBottomOffset,
  };
}