import {mockMatches, mockModelStats, mockValueBets} from '@/lib/mock-data';
import type {Match, ModelStats, ValueBet} from '@/types/analytics';

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

export async function getValueBets(minEv = 0.03, locale = 'ru'): Promise<ValueBet[]> {
  const rows = await fetchJson<ApiValueBet[]>(`/value-bets?min_ev=${minEv}`);
  return rows.map((row) => ({
    id: row.id,
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

export const fallbackData = {
  matches: mockMatches,
  valueBets: mockValueBets,
  modelStats: mockModelStats
};
