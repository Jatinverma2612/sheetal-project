import { create } from "zustand";

export const useProductModal = create((set) => ({
    openProductId: null,
    openModal: (id) => set({ openProductId: id }),
    closeModal: () => set({ openProductId: null }),
}));