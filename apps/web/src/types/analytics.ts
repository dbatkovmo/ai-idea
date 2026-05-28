export type ValueBet = {
  id: string;
  league: string;
  leagueSlug: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  selection: 'Home' | 'Draw' | 'Away';
  modelProbability: number;
  bookmakerOdds: number;
  fairOdds: number;
  ev: number;
  bookmaker: 'Fonbet' | 'Winline';
};

export type Match = {
  id: string;
  league: string;
  leagueSlug: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  homeProbability: number;
  drawProbability: number;
  awayProbability: number;
};

export type OddsPoint = {
  time: string;
  opening: number;
  current: number;
  fair: number;
};

export type ModelStats = {
  modelVersion: string;
  roi: number;
  yieldRate: number;
  clv: number;
  hitRate: number;
  maxDrawdown: number;
  brierScore: number;
  sampleSize: number;
};

export type ApiState<T> = {
  data: T;
  isLoading: boolean;
  error: string | null;
  source: 'api' | 'mock';
};
