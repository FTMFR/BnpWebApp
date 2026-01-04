import { ref, readonly, onMounted } from 'vue';

export type ThemeMode = 'light' | 'dark';

const theme = ref<ThemeMode>('light');

export function useTheme() {
  const setTheme = (mode: ThemeMode) => {
    theme.value = mode;
    const root = document.documentElement;

    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem('theme', mode);
  };

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light');
  };

  const initTheme = () => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;

    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
      return;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  // Watch for system theme changes
  onMounted(() => {
    initTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  });

  return {
    theme: readonly(theme),
    setTheme,
    toggleTheme,
    initTheme,
  };
}

