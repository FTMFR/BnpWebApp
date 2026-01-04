import { computed } from 'vue';
import { colors, type ColorPalette, type ThemeMode } from '@/design-system/tokens/colors';

/**
 * Composable for accessing color palette
 * Usage: const { primary, background, text } = useColors();
 */
export function useColors(theme: ThemeMode = 'light') {
  const palette = computed<ColorPalette>(() => 
    theme === 'dark' ? colors.dark : colors.light
  );

  return {
    colors: palette,
    primary: computed(() => palette.value.primary),
    secondary: computed(() => palette.value.secondary),
    success: computed(() => palette.value.success),
    warning: computed(() => palette.value.warning),
    danger: computed(() => palette.value.danger),
    neutral: computed(() => palette.value.neutral),
    background: computed(() => palette.value.background),
    text: computed(() => palette.value.text),
    border: computed(() => palette.value.border),
    card: computed(() => palette.value.card),
    popover: computed(() => palette.value.popover),
    input: computed(() => palette.value.input),
    sidebar: computed(() => palette.value.sidebar),
    chart: computed(() => palette.value.chart),
  };
}

