import { ref, watchEffect } from 'vue';

const isDark = ref(false);

export function useDarkMode() {
  const saved = localStorage.getItem('admin-theme');
  if (saved === 'dark') {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }

  watchEffect(() => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  });

  const toggle = () => {
    isDark.value = !isDark.value;
  };

  return { isDark, toggle };
}
