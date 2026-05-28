import {create} from 'zustand';

type DashboardState = {
  league: string;
  minEv: number;
  setLeague: (league: string) => void;
  setMinEv: (minEv: number) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  league: 'all',
  minEv: 0.03,
  setLeague: (league) => set({league}),
  setMinEv: (minEv) => set({minEv})
}));
