import { useQuasar, Dark } from 'quasar';
import { useStorageStore } from 'stores/storage-store';

export function useDarkMode() {
  const $q = useQuasar();
  const storage = useStorageStore();

  // 从 localStorage 读取用户偏好
  function getStoredDarkMode(): boolean | null {
    return storage.getDarkMode();
  }

  // 保存用户偏好到 localStorage
  function setStoredDarkMode(value: boolean | null) {
    storage.setDarkMode(value);
  }

  // 初始化 dark mode
  function initDarkMode() {
    const stored = getStoredDarkMode();
    if (stored !== null) {
      Dark.set(stored);
    } else {
      Dark.set('auto');
    }
  }

  // 切换 dark mode
  function toggleDarkMode() {
    Dark.toggle();
    setStoredDarkMode(Dark.isActive);
  }

  // 设置 dark mode
  function setDarkMode(value: boolean) {
    Dark.set(value);
    setStoredDarkMode(value);
  }

  // 监听系统主题变化（仅在 auto 模式下）
  function watchSystemTheme(callback: (isDark: boolean) => void) {
    if ($q.dark.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      callback(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => callback(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    return () => {};
  }

  return {
    isDark: $q.dark.isActive,
    darkMode: $q.dark.mode,
    initDarkMode,
    toggleDarkMode,
    setDarkMode,
    watchSystemTheme,
  };
}
