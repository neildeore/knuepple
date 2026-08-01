import { Team } from "../data/teams";

export type GameMode = "daily" | "random";

const START_DATE = "2026-08-01";
const TIME_ZONE = "America/New_York";

function getDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function daysBetween(startDate: string, currentDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const current = new Date(`${currentDate}T00:00:00Z`);

  return Math.floor((current.getTime() - start.getTime()) / 86400000);
}

function seededIndex(seed: number, length: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return Math.floor((x - Math.floor(x)) * length);
}

export function getPuzzleNumber(dateKey = getDateKey()) {
  return daysBetween(START_DATE, dateKey) + 1;
}

export function getDailyTeam(teams: Team[], dateKey = getDateKey()) {
  const puzzleNumber = getPuzzleNumber(dateKey);
  const index = seededIndex(puzzleNumber, teams.length);

  return teams[index];
}

export function getRandomTeam(teams: Team[]) {
  return teams[Math.floor(Math.random() * teams.length)];
}

export function getTodayDateKey() {
  return getDateKey();
}
