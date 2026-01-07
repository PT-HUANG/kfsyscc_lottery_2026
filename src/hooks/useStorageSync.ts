import { useEffect } from 'react';
import { useLotteryDataStore } from '@/stores/useLotteryDataStore';
import { useLotterySelectionStore } from '@/stores/useLotterySelectionStore';
import { useBackgroundStore } from '@/stores/useBackgroundStore';
import { useLotteryUIStore } from '@/stores/useLotteryUIStore';
import { useThemeStore } from '@/stores/useThemeStore';

export function useStorageSync() {
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'kfsyscc-lottery-storage') {
        useLotteryDataStore.persist.rehydrate();
      } else if (e.key === 'lottery-selection') {
        useLotterySelectionStore.persist.rehydrate();
      } else if (e.key === 'background-config') {
        useBackgroundStore.persist.rehydrate();
      } else if (e.key === 'lottery-ui') {
        useLotteryUIStore.persist.rehydrate();
      } else if (e.key === 'lottery-theme-storage') {
        useThemeStore.persist.rehydrate();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
}
