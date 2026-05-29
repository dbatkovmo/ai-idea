import type {BacktestResult, Match, ModelStats, OddsPoint, ValueBet} from '@/types/analytics';

export const mockValueBets: ValueBet[] = [
  {
    id: 'vb-001',
    matchId: 'match-001',
    league: 'Premier League',
    leagueSlug: 'premier-league',
    kickoff: 'Sat 15:00',
    homeTeam: 'Arsenal',
    awayTeam: 'Newcastle',
    selection: 'Home',
    modelProbability: 0.58,
    bookmakerOdds: 1.86,
    fairOdds: 1.72,
    ev: 0.079,
    bookmaker: 'Fonbet'
  },
  {
    id: 'vb-002',
    matchId: 'match-002',
    league: 'La Liga',
    leagueSlug: 'la-liga',
    kickoff: 'Sat 18:30',
    homeTeam: 'Real Sociedad',
    awayTeam: 'Villarreal',
    selection: 'Draw',
    modelProbability: 0.31,
    bookmakerOdds: 3.55,
    fairOdds: 3.23,
    ev: 0.101,
    bookmaker: 'Winline'
  },
  {
    id: 'vb-003',
    matchId: 'match-003',
    league: 'Serie A',
    leagueSlug: 'serie-a',
    kickoff: 'Sun 20:45',
    homeTeam: 'Roma',
    awayTeam: 'Lazio',
    selection: 'Away',
    modelProbability: 0.34,
    bookmakerOdds: 3.12,
    fairOdds: 2.94,
    ev: 0.061,
    bookmaker: 'Fonbet'
  },
  {
    id: 'vb-004',
    matchId: 'match-004',
    league: 'Bundesliga',
    leagueSlug: 'bundesliga',
    kickoff: 'Sun 17:30',
    homeTeam: 'Leipzig',
    awayTeam: 'Freiburg',
    selection: 'Home',
    modelProbability: 0.62,
    bookmakerOdds: 1.72,
    fairOdds: 1.61,
    ev: 0.066,
    bookmaker: 'Winline'
  },
  {
    id: 'vb-005',
    matchId: 'match-005',
    league: 'Ligue 1',
    leagueSlug: 'ligue-1',
    kickoff: 'Fri 21:00',
    homeTeam: 'Lille',
    awayTeam: 'Rennes',
    selection: 'Home',
    modelProbability: 0.47,
    bookmakerOdds: 2.24,
    fairOdds: 2.13,
    ev: 0.053,
    bookmaker: 'Fonbet'
  }
];

export const mockOddsMovement: OddsPoint[] = [
  {time: 'Open', opening: 2.16, current: 2.16, fair: 2.05},
  {time: '-36h', opening: 2.16, current: 2.11, fair: 2.04},
  {time: '-24h', opening: 2.16, current: 2.07, fair: 2.02},
  {time: '-12h', opening: 2.16, current: 2.01, fair: 2.01},
  {time: 'Now', opening: 2.16, current: 1.96, fair: 2.00}
];

export const mockMatches: Match[] = [
  {
    id: 'match-001',
    league: 'Premier League',
    leagueSlug: 'premier-league',
    kickoff: 'Sat 15:00',
    homeTeam: 'Arsenal',
    awayTeam: 'Newcastle',
    status: 'scheduled',
    homeProbability: 0.58,
    drawProbability: 0.24,
    awayProbability: 0.18
  },
  {
    id: 'match-002',
    league: 'La Liga',
    leagueSlug: 'la-liga',
    kickoff: 'Sat 18:30',
    homeTeam: 'Real Sociedad',
    awayTeam: 'Villarreal',
    status: 'scheduled',
    homeProbability: 0.39,
    drawProbability: 0.31,
    awayProbability: 0.3
  },
  {
    id: 'match-003',
    league: 'Serie A',
    leagueSlug: 'serie-a',
    kickoff: 'Sun 20:45',
    homeTeam: 'Roma',
    awayTeam: 'Lazio',
    status: 'scheduled',
    homeProbability: 0.35,
    drawProbability: 0.31,
    awayProbability: 0.34
  },
  {
    id: 'match-004',
    league: 'Bundesliga',
    leagueSlug: 'bundesliga',
    kickoff: 'Sun 17:30',
    homeTeam: 'Leipzig',
    awayTeam: 'Freiburg',
    status: 'scheduled',
    homeProbability: 0.62,
    drawProbability: 0.22,
    awayProbability: 0.16
  }
];

export const mockModelStats: ModelStats = {
  modelVersion: 'poisson-elo-v1',
  roi: 0.041,
  yieldRate: 0.038,
  clv: 0.024,
  hitRate: 0.472,
  maxDrawdown: -0.118,
  brierScore: 0.041,
  sampleSize: 1240
};

export const mockBacktestResult: BacktestResult = {
  id: 'bt-seed-001',
  modelVersion: 'poisson-elo-v1',
  window: '90D',
  league: 'All leagues',
  roi: 0.041,
  clv: 0.024,
  maxDrawdown: -0.118,
  hitRate: 0.472,
  sampleSize: 1240,
  losingStreak: 7,
  profitCurve: [
    {period: 'W1', bankroll: 100.0, drawdown: 0},
    {period: 'W2', bankroll: 101.8, drawdown: -0.012},
    {period: 'W3', bankroll: 99.6, drawdown: -0.036},
    {period: 'W4', bankroll: 103.2, drawdown: -0.006},
    {period: 'W5', bankroll: 105.7, drawdown: 0},
    {period: 'W6', bankroll: 104.1, drawdown: -0.021},
    {period: 'W7', bankroll: 107.4, drawdown: 0},
    {period: 'W8', bankroll: 109.2, drawdown: 0},
    {period: 'W9', bankroll: 108.0, drawdown: -0.015},
    {period: 'W10', bankroll: 112.1, drawdown: 0}
  ]
};
