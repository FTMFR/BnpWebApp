import { ref, readonly, onMounted, onUnmounted } from 'vue';

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

const currentBreakpoint = ref<Breakpoint>('sm');
const windowWidth = ref(window.innerWidth);

export function useBreakpoint() {
  const updateBreakpoint = () => {
    windowWidth.value = window.innerWidth;

    if (windowWidth.value >= breakpoints['2xl']) {
      currentBreakpoint.value = '2xl';
    } else if (windowWidth.value >= breakpoints.xl) {
      currentBreakpoint.value = 'xl';
    } else if (windowWidth.value >= breakpoints.lg) {
      currentBreakpoint.value = 'lg';
    } else if (windowWidth.value >= breakpoints.md) {
      currentBreakpoint.value = 'md';
    } else {
      currentBreakpoint.value = 'sm';
    }
  };

  const isBreakpoint = (bp: Breakpoint): boolean => {
    return currentBreakpoint.value === bp;
  };

  const isAbove = (bp: Breakpoint): boolean => {
    return windowWidth.value >= breakpoints[bp];
  };

  const isBelow = (bp: Breakpoint): boolean => {
    return windowWidth.value < breakpoints[bp];
  };

  onMounted(() => {
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateBreakpoint);
  });

  return {
    breakpoint: readonly(currentBreakpoint),
    width: readonly(windowWidth),
    isBreakpoint,
    isAbove,
    isBelow,
  };
}

