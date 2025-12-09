// src/stores/useCompanyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CompanyDetails } from '@/api/companyApi';

interface CompanyState {
  company: CompanyDetails | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCompany: (company: CompanyDetails) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCompany: () => void;
  clearError: () => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      company: null,
      isLoading: false,
      error: null,

      setCompany: (company) => set({ company, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearCompany: () => set({ company: null, error: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'company-storage',
      partialize: (state) => ({ company: state.company }),
    }
  )
);
