import { create } from "zustand";

interface AnimationStore {
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  toggleAnimation: () => void;
}

export const useAnimationStore = create<AnimationStore>((set) => ({
  isAnimating: false,
  setIsAnimating: (value) => set({ isAnimating: value }),
  toggleAnimation: () => set((state) => ({ isAnimating: !state.isAnimating })),
}));
