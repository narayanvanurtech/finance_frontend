import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BusinessDetails = {
  businessName: string;
  brandName?: string;
  teamSize: string;
  website?: string;
  phone: string;
  country: string;
  currency: string;
  hasGst: boolean;
  gstNumber?: string;
  igstn?: string;
  igstnState?: string;
  state?: string;
  _id?:string;
};

interface BussinessStore {
  details: BusinessDetails | null;
  setDetails: (details: BusinessDetails) => void;
  clearDetails: () => void;
}

export const useBussinessStore = create<BussinessStore>()(
  persist(
    (set) => ({
      details: null,
      setDetails: (details) => set({ details }),
      clearDetails: () => set({ details: null }),
    }),
    {
      name: "bussiness-details-store", // unique name in localStorage
    }
  )
);
