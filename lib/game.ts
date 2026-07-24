import { Team } from "../data/teams";

export type Result = "correct" | "partial" | "wrong";

const borderingStates: Record<string, string[]> = {
  AL: ["FL", "GA", "MS", "TN"],
  AK: [],
  AZ: ["CA", "NV", "UT", "NM", "CO"],
  AR: ["LA", "MS", "MO", "OK", "TN", "TX"],
  CA: ["AZ", "NV", "OR"],
  CO: ["AZ", "KS", "NE", "NM", "OK", "UT", "WY"],
  CT: ["MA", "NY", "RI"],
  DE: ["MD", "NJ", "PA"],
  FL: ["AL", "GA"],
  GA: ["AL", "FL", "NC", "SC", "TN"],
  HI: [],
  ID: ["MT", "NV", "OR", "UT", "WA", "WY"],
  IL: ["IN", "IA", "KY", "MO", "WI"],
  IN: ["IL", "KY", "MI", "OH"],
  IA: ["IL", "MN", "MO", "NE", "SD", "WI"],
  KS: ["CO", "MO", "NE", "OK"],
  KY: ["IL", "IN", "MO", "OH", "TN", "VA", "WV"],
  LA: ["AR", "MS", "TX"],
  ME: ["NH"],
  MD: ["DE", "PA", "VA", "WV", "DC"],
  MA: ["CT", "NH", "NY", "RI", "VT"],
  MI: ["IN", "OH", "WI"],
  MN: ["IA", "ND", "SD", "WI"],
  MS: ["AL", "AR", "LA", "TN"],
  MO: ["AR", "IL", "IA", "KS", "KY", "NE", "OK", "TN"],
  MT: ["ID", "ND", "SD", "WY"],
  NE: ["CO", "IA", "KS", "MO", "SD", "WY"],
  NV: ["AZ", "CA", "ID", "OR", "UT"],
  NH: ["ME", "MA", "VT"],
  NJ: ["DE", "NY", "PA"],
  NM: ["AZ", "CO", "OK", "TX", "UT"],
  NY: ["CT", "MA", "NJ", "PA", "VT"],
  NC: ["GA", "SC", "TN", "VA"],
  ND: ["MN", "MT", "SD"],
  OH: ["IN", "KY", "MI", "PA", "WV"],
  OK: ["AR", "CO", "KS", "MO", "NM", "TX"],
  OR: ["CA", "ID", "NV", "WA"],
  PA: ["DE", "MD", "NJ", "NY", "OH", "WV"],
  RI: ["CT", "MA"],
  SC: ["GA", "NC"],
  SD: ["IA", "MN", "MT", "NE", "ND", "WY"],
  TN: ["AL", "AR", "GA", "KY", "MS", "MO", "NC", "VA"],
  TX: ["AR", "LA", "NM", "OK"],
  UT: ["AZ", "CO", "ID", "NV", "NM", "WY"],
  VT: ["MA", "NH", "NY"],
  VA: ["KY", "MD", "NC", "TN", "WV", "DC"],
  WA: ["ID", "OR"],
  DC: ["MD", "VA"],
  WV: ["KY", "MD", "OH", "PA", "VA"],
  WI: ["IL", "IA", "MI", "MN"],
  WY: ["CO", "ID", "MT", "NE", "SD", "UT"],
};

export function compareTeams(
  guess: Team,
  target: Team,
): Record<string, Result> {
  const guessColors = [...guess.colors].sort().join(",");
  const targetColors = [...target.colors].sort().join(",");

  const colorOverlap = guess.colors.some((color) =>
    target.colors.includes(color),
  );

  return {
    conference: guess.conference === target.conference ? "correct" : "wrong",

    state: compareState(guess.state, target.state),

    colors:
      guessColors === targetColors
        ? "correct"
        : colorOverlap
          ? "partial"
          : "wrong",

    mascotType: guess.mascotType === target.mascotType ? "correct" : "wrong",

    nationalTitle: compareNumberCategory(
      guess.nationalTitle,
      target.nationalTitle,
    ),

    lastTournament: compareTournamentCategory(
      guess.lastTournament,
      target.lastTournament,
    ),

    tournamentAppearances: compareNumberCategory(
      guess.tournamentAppearances,
      target.tournamentAppearances,
    ),
  };
}

export function compareNumberCategory(guess: number, target: number): Result {
  if (guess === target) return "correct";
  if (Math.abs(guess - target) <= 2) return "partial";
  return "wrong";
}

export function compareTournamentCategory(
  guess: number | "N/A",
  target: number | "N/A",
): Result {
  if (guess === target) return "correct";

  if (guess === "N/A" || target === "N/A") {
    return "wrong";
  }

  if (Math.abs(guess - target) <= 2) return "partial";

  return "wrong";
}

export function compareState(guessState: string, targetState: string): Result {
  if (guessState === targetState) return "correct";

  const neighbors = borderingStates[targetState] ?? [];

  if (neighbors.includes(guessState)) return "partial";

  return "wrong";
}

export function getNumberHint(guess: number, target: number) {
  if (guess === target) return "";
  return guess < target ? " ↑" : " ↓";
}

export function getCellColor(result: Result) {
  if (result === "correct") return "bg-green-600";
  if (result === "partial") return "bg-yellow-500 text-black";
  return "bg-neutral-700";
}

export function getTournamentHint(guess: Team, target: Team) {
  if (guess.lastTournament === target.lastTournament) return "";

  if (guess.lastTournament === "N/A" || target.lastTournament === "N/A") {
    return "";
  }

  return guess.lastTournament < target.lastTournament ? " ↑" : " ↓";
}

export function resultToEmoji(result: Result) {
  if (result === "correct") return "🟩";
  if (result === "partial") return "🟨";
  return "⬛";
}
