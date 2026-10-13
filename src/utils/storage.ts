import { ScoreRecord } from '../types/game';

const STORAGE_KEY = 'astrovoid_arcade_leaderboard_v1';

const DEFAULT_HALL_OF_FAME: ScoreRecord[] = [
  {
    id: 'rec_1',
    callsign: 'VIPER-01',
    score: 88500,
    wave: 14,
    kills: 142,
    accuracy: 89,
    date: '2026-10-12'
  },
  {
    id: 'rec_2',
    callsign: 'CYBER-NEO',
    score: 65200,
    wave: 11,
    kills: 108,
    accuracy: 84,
    date: '2026-10-10'
  },
  {
    id: 'rec_3',
    callsign: 'STAR-FOX',
    score: 48900,
    wave: 9,
    kills: 82,
    accuracy: 79,
    date: '2026-10-09'
  },
  {
    id: 'rec_4',
    callsign: 'PHOENIX',
    score: 36400,
    wave: 7,
    kills: 63,
    accuracy: 76,
    date: '2026-10-08'
  },
  {
    id: 'rec_5',
    callsign: 'COSMO-X',
    score: 24800,
    wave: 5,
    kills: 44,
    accuracy: 72,
    date: '2026-10-07'
  },
  {
    id: 'rec_6',
    callsign: 'VALKYRIE',
    score: 18200,
    wave: 4,
    kills: 31,
    accuracy: 68,
    date: '2026-10-05'
  },
  {
    id: 'rec_7',
    callsign: 'ORION-9',
    score: 12500,
    wave: 3,
    kills: 22,
    accuracy: 65,
    date: '2026-10-04'
  }
];

export function getLeaderboard(): ScoreRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveLeaderboard(DEFAULT_HALL_OF_FAME);
      return DEFAULT_HALL_OF_FAME;
    }
    const parsed: ScoreRecord[] = JSON.parse(raw);
    return parsed.sort((a, b) => b.score - a.score);
  } catch {
    return DEFAULT_HALL_OF_FAME;
  }
}

export function saveLeaderboard(records: ScoreRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {}
}

export function addScoreRecord(newRecord: Omit<ScoreRecord, 'id' | 'rank'>): {
  records: ScoreRecord[];
  rank: number;
} {
  const records = getLeaderboard();
  const entry: ScoreRecord = {
    ...newRecord,
    id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  };

  records.push(entry);
  records.sort((a, b) => b.score - a.score);

  // Keep top 50
  const trimmed = records.slice(0, 50);
  saveLeaderboard(trimmed);

  const rank = trimmed.findIndex((r) => r.id === entry.id) + 1;
  return { records: trimmed, rank: rank > 0 ? rank : trimmed.length };
}

export function getHighScore(): number {
  const records = getLeaderboard();
  return records.length > 0 ? records[0].score : 0;
}
