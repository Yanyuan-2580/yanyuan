import { ref } from 'vue';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
  function show(message: string, type: Toast['type'] = 'info', duration: number = 3000) {
    const id = nextId++;
    toasts.value.push({ id, message, type, duration });
    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
    return id;
  }

  function success(message: string, duration?: number) {
    return show(message, 'success', duration);
  }

  function error(message: string, duration?: number) {
    return show(message, 'error', duration || 5000);
  }

  function warning(message: string, duration?: number) {
    return show(message, 'warning', duration || 4000);
  }

  function info(message: string, duration?: number) {
    return show(message, 'info', duration);
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, show, success, error, warning, info, remove };
}

// Singleton instance for use outside of Vue components (e.g., axios interceptors)
let singleton: ReturnType<typeof useToast> | null = null;
export function getToast() {
  if (!singleton) {
    singleton = useToast();
  }
  return singleton;
}
