import {mockBacktestResult, mockMatches, mockModelStats, mockValueBets} from '@/lib/mock-data';
import type {BacktestResult, Match, ModelStats, OddsPoint, ValueBet} from '@/types/analytics';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type ApiMatch = {
  id: string;
  league: string;
  kickoff_at: string;
  home_team: string;
  away_team: string;
  status: string;
  home_probability: number;
  draw_probability: number;
  away_probability: number;
};

type ApiValueBet = {
  id: string;
  match_id: string;
  league: string;
  kickoff_at: string;
  home_team: string;
  away_team: string;
  selection: 'home' | 'draw' | 'away';
  bookmaker: string;
  probability: number;
  bookmaker_odds: number;
  fair_odds: number;
  ev: number;
  confidence_score: number;
  recommendation_score: number;
};

type ApiModelStats = {
  model_version: string;
  roi: number;
  yield_rate: number;
  clv: number;
  hit_rate: number;
  max_drawdown: number;
  brier_score: number;
  sample_size: number;
};

type ApiOddsPoint = {
  time: string;
  opening: number;
  current: number;
  fair: number;
};

type ApiBacktestResult = {
  id: string;
  model_version: string;
  window: string;
  league: string;
  roi: number;
  clv: number;
  max_drawdown: number;
  hit_rate: number;
  sample_size: number;
  losing_streak: number;
  profit_curve: Array<{
    period: string;
    bankroll: number;
    drawdown: number;
  }>;
};

function leagueSlug(league: string) {
  return league.toLowerCase().replaceAll(' ', '-');
}

function formatKickoff(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en' : 'ru-RU', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function createQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export async function getMatches(locale = 'ru'): Promise<Match[]> {
  const rows = await fetchJson<ApiMatch[]>('/matches');
  return rows.map((row) => ({
    id: row.id,
    league: row.league,
    leagueSlug: leagueSlug(row.league),
    kickoff: formatKickoff(row.kickoff_at, locale),
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    status: row.status,
    homeProbability: row.home_probability,
    drawProbability: row.draw_probability,
    awayProbability: row.away_probability
  }));
}

export async function getValueBets(minEv = 0.03, locale = 'ru', league?: string): Promise<ValueBet[]> {
  const rows = await fetchJson<ApiValueBet[]>(
    `/value-bets${createQuery({
      min_ev: minEv,
      league: league === 'all' ? undefined : league
    })}`
  );
  return rows.map((row) => ({
    id: row.id,
    matchId: row.match_id,
    league: row.league,
    leagueSlug: leagueSlug(row.league),
    kickoff: formatKickoff(row.kickoff_at, locale),
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    selection: row.selection === 'home' ? 'Home' : row.selection === 'draw' ? 'Draw' : 'Away',
    modelProbability: row.probability,
    bookmakerOdds: row.bookmaker_odds,
    fairOdds: row.fair_odds,
    ev: row.ev,
    bookmaker: row.bookmaker === 'winline' ? 'Winline' : 'Fonbet'
  }));
}

export async function getModelStats(): Promise<ModelStats> {
  const row = await fetchJson<ApiModelStats>('/model-stats');
  return {
    modelVersion: row.model_version,
    roi: row.roi,
    yieldRate: row.yield_rate,
    clv: row.clv,
    hitRate: row.hit_rate,
    maxDrawdown: row.max_drawdown,
    brierScore: row.brier_score,
    sampleSize: row.sample_size
  };
}

export async function getOddsMovement(matchId: string, bookmaker?: string, selection?: string): Promise<OddsPoint[]> {
  const rows = await fetchJson<ApiOddsPoint[]>(
    `/matches/${matchId}/odds-movement${createQuery({
      bookmaker: bookmaker?.toLowerCase(),
      selection: selection?.toLowerCase()
    })}`
  );
  return rows.map((row) => ({
    time: row.time,
    opening: row.opening,
    current: row.current,
    fair: row.fair
  }));
}

function mapBacktest(row: ApiBacktestResult): BacktestResult {
  return {
    id: row.id,
    modelVersion: row.model_version,
    window: row.window,
    league: row.league,
    roi: row.roi,
    clv: row.clv,
    maxDrawdown: row.max_drawdown,
    hitRate: row.hit_rate,
    sampleSize: row.sample_size,
    losingStreak: row.losing_streak,
    profitCurve: row.profit_curve.map((point) => ({
      period: point.period,
      bankroll: point.bankroll,
      drawdown: point.drawdown
    }))
  };
}

export async function getLatestBacktest(): Promise<BacktestResult> {
  return mapBacktest(await fetchJson<ApiBacktestResult>('/backtests/latest'));
}

export async function runBacktest(window = '90D', league?: string, minEv = 0.03): Promise<BacktestResult> {
  return mapBacktest(
    await postJson<ApiBacktestResult>('/backtests', {
      window,
      league: league === 'all' ? undefined : league,
      min_ev: minEv,
      model_version: 'poisson-elo-v1'
    })
  );
}

export const fallbackData = {
  matches: mockMatches,
  valueBets: mockValueBets,
  modelStats: mockModelStats,
  backtestResult: mockBacktestResult
};
