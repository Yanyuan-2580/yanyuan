import { ref, watchEffect } from 'vue';

const isDark = ref(false);

export function useDarkMode() {
  // Initialize from localStorage
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }

  watchEffect(() => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  });

  const toggle = () => {
    isDark.value = !isDark.value;
  };

  return { isDark, toggle };
}
