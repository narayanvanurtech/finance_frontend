import { create } from 'zustand';

interface SelectedItemsState {
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  clearSelectedItems: () => void;
}

export const useSelectedItemsStore = create<SelectedItemsState>((set) => ({
  selectedItems: [],
  setSelectedItems: (items) => set({ selectedItems: items }),
  clearSelectedItems: () => set({ selectedItems: [] }),
}));
