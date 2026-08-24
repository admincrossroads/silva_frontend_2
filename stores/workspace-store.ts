import { create } from "zustand";
import { persist } from "zustand/middleware";

type WorkspaceState = {
  activeFarmEstateId: string | null;
  setActiveFarmEstateId: (id: string | null) => void;
  resetForProgram: (programId: string | null) => void;
  lastProgramId: string | null;
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      activeFarmEstateId: null,
      lastProgramId: null,
      setActiveFarmEstateId: (activeFarmEstateId) => set({ activeFarmEstateId }),
      resetForProgram: (programId) => {
        if (get().lastProgramId !== programId) {
          set({ lastProgramId: programId, activeFarmEstateId: null });
        }
      },
    }),
    { name: "coffee-field-os-workspace" },
  ),
);
