"use client";

import Fuse from "fuse.js";
import { useEffect, useRef, useState } from "react";
import { teams, Team } from "../data/teams";
import {
  compareTeams,
  getCellColor,
  getTournamentHint,
  getNumberHint,
  resultToEmoji,
} from "../lib/game";
import { FaHatCowboySide, FaWandMagicSparkles } from "react-icons/fa6";
import {
  GiBee,
  GiGriffinSymbol,
  GiLion,
  GiEagleHead,
  GiLightningStorm,
} from "react-icons/gi";
import {
  GameMode,
  getDailyTeam,
  getPuzzleNumber,
  getRandomTeam,
  getTodayDateKey,
} from "../lib/dailyPuzzle";
import { FaChartBar } from "react-icons/fa";
import { FaQuestionCircle } from "react-icons/fa";

const stateNames: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

const teamColors: Record<string, string> = {
  Black: "#000000",
  Blue: "#003DA5",
  Brown: "#4E3629",
  Crimson: "#9E1B32",
  Garnet: "#73000A",
  Gold: "#FFD100",
  Gray: "#808080",
  Green: "#006747",
  "Light Blue": "#6ECFF6",
  Maroon: "#800000",
  Navy: "#002147",
  Orange: "#F76900",
  Purple: "#582C83",
  Red: "#C8102E",
  Silver: "#C0C0C0",
  White: "#FFFFFF",
  Yellow: "#FFD700",
};

const conferenceLogos: Record<string, string> = {
  "Big 10": "/logos/Big10.png",
  ACC: "/logos/ACC.png",
  SEC: "/logos/SEC.png",
  "Big 12": "/logos/Big12.png",
  "Big East": "/logos/BigEast.png",
  "West Coast Conference": "/logos/WCC.png",
  "American Athletic Conference": "/logos/AAC.png",
  "Mountain West Conference": "/logos/MWC.png",
  "Atlantic 10": "/logos/A10.png",
  "Missouri Valley Conference": "/logos/MVC.png",
  "Conference USA": "/logos/CUSA.png",
  "Western Athletic Conference": "/logos/WAC.png",
  "Mid-American Conference": "/logos/MAC.png",
  "Sun Belt Conference": "/logos/SBC.png",
  "Ivy League": "/logos/Ivy.png",
  "Patriot League": "/logos/Patriot.png",
  "Horizon League": "/logos/Horizon.png",
  "Big Sky": "/logos/BigSky.svg",
  "Big South": "/logos/BigSouth.png",
  "Big West": "/logos/BigWest.png",
  "Coastal Athletic Association": "/logos/CAA.png",
  "Metro Atlantic Athletic Conference": "/logos/MAAC.png",
  "Mid-Eastern Athletic Conference": "/logos/MEAC.png",
  "Northeast Conference": "/logos/NEC.png",
  "Ohio Valley Conference": "/logos/OVC.png",
  "Southern Conference": "/logos/SOCON.png",
  "Southland Conference": "/logos/SLC.png",
  "Southwestern Athletic Conference": "/logos/SWAC.png",
  "Summit League": "/logos/Summit.png",
  "America East Conference": "/logos/AEC.png",
  "Atlantic Sun Conference": "/logos/ASUN.png",
};

function ColorBasketball({ colors }: { colors: string[] }) {
  const first = teamColors[colors[0]] ?? "#666";
  const second = colors.length > 1 ? teamColors[colors[1]] : first;

  return (
    <div className="relative mx-auto h-14 w-14 overflow-hidden rounded-full">
      <div
        className="absolute left-0 top-0 h-full w-1/2"
        style={{ backgroundColor: first }}
      />
      <div
        className="absolute right-0 top-0 h-full w-1/2"
        style={{ backgroundColor: second }}
      />

      <img
        src="/icons/basketball-thin-svgrepo-com.svg"
        alt="team colors"
        style={{
          transform: "scale(1.4)",
        }}
        className="absolute inset-0 w-full h-full object-contain"
      />
    </div>
  );
}

function ConferenceLogo({ conference }: { conference: string }) {
  const logoUrl = conferenceLogos[conference];

  if (!logoUrl) {
    return <span>{conference}</span>;
  }

  return (
    <img
      src={logoUrl}
      alt={conference}
      title={conference}
      className="mx-auto h-20 max-w-full object-contain translate-y-1"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

const mascotIcons: Record<string, React.ElementType> = {
  Human: FaHatCowboySide,
  Animal: GiLion,
  Bird: GiEagleHead,
  Bug: GiBee,
  Mythic: GiGriffinSymbol,
  Phenomenon: GiLightningStorm,
  Color: FaWandMagicSparkles,
};

function MascotIcon({ mascotType }: { mascotType: string }) {
  const Icon = mascotIcons[mascotType];

  if (!Icon) {
    return <span>{mascotType}</span>;
  }

  return (
    <div title={mascotType} className="flex items-center justify-center">
      <Icon className="h-12 w-12" />
    </div>
  );
}

export default function Home() {
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  useEffect(() => {
    const hasSeenHowToPlay = localStorage.getItem(
      "knuepple-has-seen-how-to-play",
    );

    if (!hasSeenHowToPlay) {
      setShowHowToPlayModal(true);
    }
  }, []);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
  });
  const [gameMode, setGameMode] = useState<GameMode>("daily");
  const [randomTeam, setRandomTeam] = useState<Team>(() =>
    getRandomTeam(teams),
  );

  const todayDateKey = getTodayDateKey();
  const dailyPuzzleNumber = getPuzzleNumber(todayDateKey);

  const targetTeam =
    gameMode === "daily" ? getDailyTeam(teams, todayDateKey) : randomTeam;

  const currentPuzzleNumber = gameMode === "daily" ? dailyPuzzleNumber : null;

  const [selectedTeam, setSelectedTeam] = useState("");
  const [guesses, setGuesses] = useState<Team[]>([]);
  const [message, setMessage] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showLogoHint, setShowLogoHint] = useState(false);
  const logoHintUnlocked = guesses.length >= 4;
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dailyStorageKey = `knuepple-daily-${todayDateKey}`;
  useEffect(() => {
    if (gameMode !== "daily") return;

    const savedGuesses = localStorage.getItem(dailyStorageKey);

    if (!savedGuesses) {
      setGuesses([]);
      return;
    }

    try {
      const teamNames = JSON.parse(savedGuesses) as string[];

      const savedTeams = teamNames
        .map((name) => teams.find((team) => team.name === name))
        .filter((team): team is Team => team !== undefined);

      setGuesses(savedTeams);
    } catch {
      localStorage.removeItem(dailyStorageKey);
      setGuesses([]);
    }
  }, [gameMode, dailyStorageKey]);
  useEffect(() => {
    if (gameMode !== "daily") return;

    localStorage.setItem(
      dailyStorageKey,
      JSON.stringify(guesses.map((team) => team.name)),
    );
  }, [guesses, gameMode, dailyStorageKey]);
  const availableTeams = teams.filter(
    (team) => !guesses.some((guess) => guess.name === team.name),
  );

  const fuse = new Fuse(availableTeams, {
    keys: ["name", "aliases", "nickname"],
    threshold: 0.2,
  });

  const filteredTeams =
    selectedTeam.trim() === ""
      ? []
      : fuse
          .search(selectedTeam)
          .map((result) => result.item)
          .slice(0, 8);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [selectedTeam]);
  useEffect(() => {
    const currentRef = suggestionRefs.current[highlightedIndex];

    if (currentRef) {
      currentRef.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  const hasWon = guesses.some((team) => team.name === targetTeam.name);
  const maxGuesses = 8;
  const hasLost = guesses.length >= maxGuesses && !hasWon;
  const gameOver = hasWon || hasLost;

  useEffect(() => {
    if (!gameOver || gameMode !== "daily" || !currentPuzzleNumber) return;

    const statsKey = "knuepple-stats";
    const completedKey = `knuepple-completed-${currentPuzzleNumber}`;

    if (localStorage.getItem(completedKey)) return;

    const saved = localStorage.getItem(statsKey);

    const previousStats = saved
      ? JSON.parse(saved)
      : {
          gamesPlayed: 0,
          wins: 0,
          currentStreak: 0,
          maxStreak: 0,
          lastCompletedPuzzleNumber: 0,
        };

    const playedYesterday =
      previousStats.lastCompletedPuzzleNumber === currentPuzzleNumber - 1;

    const newCurrentStreak = hasWon
      ? playedYesterday
        ? previousStats.currentStreak + 1
        : 1
      : 0;

    const updatedStats = {
      gamesPlayed: previousStats.gamesPlayed + 1,
      wins: hasWon ? previousStats.wins + 1 : previousStats.wins,
      currentStreak: newCurrentStreak,
      maxStreak: Math.max(previousStats.maxStreak, newCurrentStreak),
      lastCompletedPuzzleNumber: currentPuzzleNumber,
    };

    setStats(updatedStats);
    localStorage.setItem(statsKey, JSON.stringify(updatedStats));
    localStorage.setItem(completedKey, "true");
  }, [gameOver, gameMode, hasWon, currentPuzzleNumber]);

  const [showResultModal, setShowResultModal] = useState(false);
  useEffect(() => {
    if (gameOver) {
      setShowResultModal(true);
    }
  }, [gameOver]);
  const [copied, setCopied] = useState(false);

  function selectSuggestion(teamName: string) {
    setSelectedTeam(teamName);
    setHighlightedIndex(0);
  }

  function handleGuess(teamName = selectedTeam) {
    if (gameOver) return;
    const team = teams.find(
      (t) => t.name.toLowerCase() === teamName.toLowerCase(),
    );

    if (!team) {
      if (filteredTeams.length > 0) {
        setMessage(`Did you mean ${filteredTeams[0].name}?`);
      } else {
        setMessage("Pick a valid team.");
      }
      return;
    }

    if (guesses.some((g) => g.name === team.name)) {
      setMessage("You already guessed that team.");
      return;
    }

    setGuesses([team, ...guesses]);
    setSelectedTeam("");
    setMessage("");

    if (team.name === targetTeam.name) {
      setMessage("Correct! You got the Knuepple.");
    } else if (guesses.length + 1 >= maxGuesses) {
      setMessage(`Game over. The answer was ${targetTeam.name}.`);
    }
  }

  function closeHowToPlay() {
    localStorage.setItem("knuepple-has-seen-how-to-play", "true");
    setShowHowToPlayModal(false);
  }

  function getShareText() {
    const rows = guesses
      .slice()
      .reverse()
      .map((team) => {
        const result = compareTeams(team, targetTeam);

        return [
          result.conference,
          result.state,
          result.colors,
          result.mascotType,
          result.nationalTitle,
          result.lastTournament,
          result.tournamentAppearances,
        ]
          .map((r) => resultToEmoji(r))
          .join("");
      })
      .join("\n");

    const puzzleLabel =
      gameMode === "daily" ? `#${currentPuzzleNumber}` : "Random";

    return `Knuepple ${puzzleLabel}
${hasWon ? guesses.length : "X"}/${maxGuesses}

${rows}`;
  }

  async function shareResult() {
    const text = getShareText();

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setMessage("Copied!");

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  async function nativeShareResult() {
    const text = getShareText();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Knuepple",
          text,
        });
      } else {
        await shareResult();
      }
    } catch (error) {
      // Closing the mobile share sheet is not an actual app error.
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      await shareResult();
    }
  }

  function resetGame() {
    if (gameMode === "daily") {
      localStorage.removeItem(dailyStorageKey);
    }

    setGuesses([]);
    setSelectedTeam("");
    setMessage("");
    setShowLogoHint(false);
    setShowResultModal(false);

    if (gameMode === "random") {
      setRandomTeam(getRandomTeam(teams));
    }
  }

  const guessesRemaining = Math.max(maxGuesses - guesses.length, 0);
  return (
    <main
      className="min-h-screen px-3 py-4 text-white sm:px-6 sm:py-6"
      style={{
        backgroundColor: "#002244",
        backgroundImage: `
      linear-gradient(
        rgba(0, 34, 68, 0.45),
        rgba(0, 34, 68, 0.55)
      ),
      url('/backgrounds/hardwood.jpg')
    `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <button
        onClick={() => setShowStatsModal(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-[#00152D]/90 p-3 text-[#F5E6C8] shadow-lg transition hover:bg-[#0038A8]"
        title="Stats"
      >
        <FaChartBar className="h-6 w-6" />
      </button>

      <button
        onClick={() => setShowHowToPlayModal(true)}
        className="fixed left-20 top-4 z-40 rounded-lg bg-[#00152D]/90 p-3 text-[#F5E6C8] shadow-lg transition hover:bg-[#0038A8]"
        title="How to Play"
      >
        <FaQuestionCircle className="h-6 w-6" />
      </button>

      <div className="mx-auto max-w-8xl">
        <div className="relative mb-2 text-center">
          <p className="college text-base tracking-wider text-[#0088FF] sm:text-xl md:text-2xl drop-shadow-[0_3px_0_#7A5C34]">
            GUESS THE D1 NCAA BASKETBALL TEAM
          </p>

          <h1 className="varsity text-5xl tracking-wider text-[#F76900] sm:text-7xl md:text-8xl [text-shadow:0_2px_0_#00152D,0_2px_2px_rgba(0,0,0,0.45)]">
            KNUEPPLE
          </h1>

          <p className="college mt-3 text-xs tracking-wider text-[#F5E6C8] drop-shadow-[0_3px_0_#001A33]">
            {guessesRemaining}{" "}
            {guessesRemaining === 1 ? "GUESS REMAINING" : "GUESSES REMAINING"}
          </p>
        </div>

        <div className="mx-auto mb-2 grid max-w-5xl grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
          {/* Daily */}
          <button
            onClick={() => {
              if (gameMode === "daily") return;

              setSelectedTeam("");
              setMessage("");
              setShowLogoHint(false);
              setShowResultModal(false);
              setGameMode("daily");
            }}
            className={`w-full rounded-lg py-3 text-lg font-extrabold uppercase tracking-wide shadow-lg transition sm:w-40 ${
              gameMode === "daily"
                ? "bg-[#0048D8] text-white hover:bg-[#0038A8]"
                : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600"
            }`}
          >
            Daily
          </button>

          {/* Search Bar */}
          <div className="relative order-first col-span-2 sm:order-0 sm:flex-1">
            <input
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              onKeyDown={(e) => {
                if (filteredTeams.length === 0) {
                  if (e.key === "Enter") {
                    handleGuess();
                  }
                  return;
                }

                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightedIndex((prev) =>
                    prev === filteredTeams.length - 1 ? 0 : prev + 1,
                  );
                }

                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightedIndex((prev) =>
                    prev === 0 ? filteredTeams.length - 1 : prev - 1,
                  );
                }

                if (e.key === "Enter") {
                  e.preventDefault();

                  const highlightedTeam = filteredTeams[highlightedIndex];

                  if (highlightedTeam) {
                    handleGuess(highlightedTeam.name);
                  } else {
                    handleGuess();
                  }
                }
              }}
              disabled={gameOver}
              placeholder="Search for a team..."
              className="w-full rounded-lg border border-[#0038A8] bg-[#00152D] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#F76900]"
            />

            {selectedTeam && !gameOver && (
              <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-[#0038A8] bg-[#00152D] shadow-xl">
                {filteredTeams.length === 0 ? (
                  <div className="px-4 py-2 text-neutral-400">
                    No available teams found
                  </div>
                ) : (
                  filteredTeams.map((team, index) => (
                    <button
                      key={team.name}
                      ref={(el) => {
                        suggestionRefs.current[index] = el;
                      }}
                      onClick={() => handleGuess(team.name)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`block w-full px-4 py-2 text-left ${
                        index === highlightedIndex
                          ? "bg-neutral-700"
                          : "hover:bg-[#0038A8]"
                      }`}
                    >
                      {team.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Random */}
          <button
            onClick={() => {
              setGameMode("random");
              setRandomTeam(getRandomTeam(teams));
              setGuesses([]);
              setSelectedTeam("");
              setMessage("");
              setShowLogoHint(false);
              setShowResultModal(false);
            }}
            className={`w-full rounded-lg py-3 text-lg font-extrabold uppercase tracking-wide shadow-lg transition sm:w-40 ${
              gameMode === "random"
                ? "bg-[#F76900] text-white hover:bg-[#E05A00]"
                : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600"
            }`}
          >
            Practice
          </button>
        </div>

        <div className="mx-auto mb-6 max-w-md">
          <button
            onClick={() => {
              if (logoHintUnlocked) {
                setShowLogoHint(true);
              }
            }}
            disabled={!logoHintUnlocked}
            className={`w-full rounded-lg py-3 text-lg font-extrabold uppercase tracking-wide shadow-lg transition
    ${
      logoHintUnlocked
        ? "bg-[#F5E6C8] text-neutral-800 hover:bg-[#E8D3A9]"
        : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
    }`}
          >
            {logoHintUnlocked
              ? "Show Logo Hint"
              : "Logo Hint Unlocks After 4 Guesses"}
          </button>
        </div>

        {message && (
          <p className="text-center mb-6 text-yellow-300">{message}</p>
        )}
        {showResultModal && gameOver && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-3 py-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-heading"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-4 border-[#005EB8] bg-[#00152D] text-center shadow-2xl">
              {/* Decorative top stripe */}
              <div className="h-2 bg-[#F76900]" />

              {/* Close button */}
              <button
                onClick={() => setShowResultModal(false)}
                className="absolute right-3 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-2xl text-[#F5E6C8] transition hover:bg-[#005EB8] hover:text-white"
                aria-label="Close result"
              >
                ×
              </button>

              <div className="px-5 pb-6 pt-5 sm:px-7">
                {/* Result heading */}
                <p className="college text-sm uppercase tracking-[0.3em] text-[#0088FF]">
                  {hasWon ? "Final Result" : "Game Over"}
                </p>

                <h2
                  id="result-heading"
                  className="varsity mt-1 text-5xl tracking-wider text-[#F76900] [text-shadow:0_2px_0_#00152D,0_3px_5px_rgba(0,0,0,0.5)] sm:text-6xl"
                >
                  {hasWon ? "YOU WON" : "NICE TRY"}
                </h2>

                {/* Answer logo */}
                <div className="mx-auto mt-4 flex h-36 w-36 items-center justify-center rounded-2xl border-4 border-[#005EB8] bg-[#E8D3A9] p-5 shadow-xl">
                  <img
                    src={targetTeam.logoUrl}
                    alt={`${targetTeam.name} logo`}
                    title={targetTeam.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Answer */}
                <p className="mt-4 text-xl font-extrabold text-[#F5E6C8] sm:text-2xl">
                  {targetTeam.name}
                </p>

                {/* Score */}
                <p className="college mt-1 text-lg tracking-wide text-[#F5E6C8]/85">
                  {hasWon
                    ? `${guesses.length} ${
                        guesses.length === 1 ? "GUESS" : "GUESSES"
                      } USED`
                    : `${maxGuesses} GUESSES USED`}
                </p>

                {gameMode === "daily" && (
                  <p className="college mt-1 text-sm tracking-widest text-[#0088FF]">
                    #{currentPuzzleNumber}
                  </p>
                )}

                {gameMode === "random" && (
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-[#F76900]">
                    Practice Mode · Stats Not Recorded
                  </p>
                )}

                {/* Emoji preview */}
                <div className="mx-auto mt-5 max-w-xs rounded-2xl border border-[#005EB8]/50 bg-black/20 p-3">
                  <div className="space-y-1 text-center text-lg leading-none">
                    {guesses
                      .slice()
                      .reverse()
                      .map((team) => {
                        const result = compareTeams(team, targetTeam);

                        const row = [
                          result.conference,
                          result.state,
                          result.colors,
                          result.mascotType,
                          result.nationalTitle,
                          result.lastTournament,
                          result.tournamentAppearances,
                        ]
                          .map((value) => resultToEmoji(value))
                          .join("");

                        return <p key={team.name}>{row}</p>;
                      })}
                  </div>
                </div>

                {/* Copy / Share */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={shareResult}
                    className={`rounded-lg py-3 text-base font-extrabold uppercase tracking-wide text-white shadow-lg transition sm:text-lg ${
                      copied
                        ? "bg-green-600"
                        : "bg-[#0048D8] hover:bg-[#0038A8]"
                    }`}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>

                  <button
                    onClick={nativeShareResult}
                    className="rounded-lg bg-[#F76900] py-3 text-base font-extrabold uppercase tracking-wide text-white shadow-lg transition hover:bg-[#E05A00] sm:text-lg"
                  >
                    Share
                  </button>
                </div>

                <button
                  onClick={() => setShowResultModal(false)}
                  className="mt-3 w-full rounded-lg border border-[#F5E6C8]/30 bg-transparent py-2.5 text-sm font-bold uppercase tracking-wide text-[#F5E6C8] transition hover:bg-white/10"
                >
                  View Completed Board
                </button>
              </div>
            </div>
          </div>
        )}

        {guesses.length > 0 && (
          <div className="varsity hidden md:grid grid-cols-8 gap-2 text-lg mb-2 text-center tracking-wider text-[#F76900]">
            <div>TEAM</div>
            <div>CONFERENCE</div>
            <div>STATE</div>
            <div>COLORS</div>
            <div>MASCOT</div>
            <div>TITLES</div>
            <div>LAST TOURNEY</div>
            <div>APPEARANCES</div>
          </div>
        )}

        <div className="space-y-3">
          {guesses.map((team) => {
            const result = compareTeams(team, targetTeam);

            return (
              <div key={team.name}>
                <div
                  key={team.name}
                  className="hidden md:grid grid-cols-8 gap-2 text-sm animate-fade-in"
                >
                  <div className="flex min-h-24 items-center justify-center rounded-lg p-3">
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      title={team.name}
                      className="h-20 w-20 object-contain"
                    />
                  </div>

                  <div
                    className={`${getCellColor(result.conference)} flex min-h-24 items-center justify-center rounded-lg border border-[#0038A8]/30 shadow-lg p-3 transition hover:scale-105 hover:brightness-115`}
                  >
                    <ConferenceLogo conference={team.conference} />
                  </div>

                  <div
                    title={stateNames[team.state]}
                    className={`${getCellColor(result.state)} flex min-h-24 items-center justify-center rounded-lg border border-[#0038A8]/30 shadow-lg p-3 text-4xl font-bold transition hover:scale-105 hover:brightness-115`}
                  >
                    {team.state}
                  </div>

                  <div
                    className={`${getCellColor(result.colors)} flex min-h-24 items-center justify-center rounded-lg border border-[#0038A8]/30 shadow-lg p-3 transition hover:scale-105 hover:brightness-115`}
                  >
                    <ColorBasketball colors={team.colors} />
                  </div>

                  <div
                    className={`${getCellColor(result.mascotType)} flex min-h-24 items-center justify-center rounded-lg border border-[#0038A8]/30 shadow-lg p-3 transition hover:scale-105 hover:brightness-115`}
                  >
                    <MascotIcon mascotType={team.mascotType} />
                  </div>

                  <div
                    className={`${getCellColor(result.nationalTitle)} flex min-h-24 items-center justify-center rounded-lg border border-[#0038A8]/30 shadow-lg p-3 text-4xl font-bold transition hover:scale-105 hover:brightness-115`}
                  >
                    {team.nationalTitle}
                    {getNumberHint(
                      team.nationalTitle,
                      targetTeam.nationalTitle,
                    )}
                  </div>

                  <div
                    className={`${getCellColor(result.lastTournament)} flex min-h-24 items-center justify-center rounded-lg border border-[#0038A8]/30 shadow-lg p-3 text-4xl font-bold transition hover:scale-105 hover:brightness-115`}
                  >
                    {team.lastTournament}
                    {getTournamentHint(team, targetTeam)}
                  </div>

                  <div
                    className={`${getCellColor(result.tournamentAppearances)} flex min-h-24 items-center justify-center rounded-lg border border-[#0038A8]/30 shadow-lg p-3 text-4xl font-bold transition hover:scale-105 hover:brightness-115`}
                  >
                    {team.tournamentAppearances}
                    {getNumberHint(
                      team.tournamentAppearances,
                      targetTeam.tournamentAppearances,
                    )}
                  </div>
                </div>
                <div className="animate-fade-in rounded-2xl border border-[#0038A8]/40 bg-[#00152D]/90 p-3 shadow-xl md:hidden">
                  {/* Team logo */}
                  <div className="mb-3 flex items-center justify-center rounded-xl bg-[#E8D3A9] p-3">
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      title={team.name}
                      className="h-20 w-20 object-contain"
                    />
                  </div>

                  {/* Conference, state, colors, mascot */}
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      title={team.conference}
                      className={`${getCellColor(result.conference)} flex min-h-24 flex-col items-center justify-center rounded-xl border border-[#0038A8]/30 p-2 shadow-lg`}
                    >
                      <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider">
                        Conference
                      </p>

                      <div className="[&_img]:h-14">
                        <ConferenceLogo conference={team.conference} />
                      </div>
                    </div>

                    <div
                      title={stateNames[team.state]}
                      className={`${getCellColor(result.state)} flex min-h-24 flex-col items-center justify-center rounded-xl border border-[#0038A8]/30 p-2 shadow-lg`}
                    >
                      <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider">
                        State
                      </p>

                      <p className="text-3xl font-extrabold">{team.state}</p>
                    </div>

                    <div
                      title={team.colors.join(" / ")}
                      className={`${getCellColor(result.colors)} flex min-h-24 flex-col items-center justify-center rounded-xl border border-[#0038A8]/30 p-2 shadow-lg`}
                    >
                      <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider">
                        Colors
                      </p>

                      <ColorBasketball colors={team.colors} />
                    </div>

                    <div
                      title={team.mascotType}
                      className={`${getCellColor(result.mascotType)} flex min-h-24 flex-col items-center justify-center rounded-xl border border-[#0038A8]/30 p-2 shadow-lg`}
                    >
                      <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider">
                        Mascot
                      </p>

                      <MascotIcon mascotType={team.mascotType} />
                    </div>
                  </div>

                  {/* Numeric categories */}
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div
                      className={`${getCellColor(result.nationalTitle)} flex min-h-20 flex-col items-center justify-center rounded-xl border border-[#0038A8]/30 p-2 text-center shadow-lg`}
                    >
                      <p className="mb-1 text-[9px] font-extrabold uppercase tracking-wide">
                        Titles
                      </p>

                      <p className="text-2xl font-extrabold">
                        {team.nationalTitle}
                        {getNumberHint(
                          team.nationalTitle,
                          targetTeam.nationalTitle,
                        )}
                      </p>
                    </div>

                    <div
                      className={`${getCellColor(result.lastTournament)} flex min-h-20 flex-col items-center justify-center rounded-xl border border-[#0038A8]/30 p-2 text-center shadow-lg`}
                    >
                      <p className="mb-1 text-[9px] font-extrabold uppercase leading-tight tracking-wide">
                        Last Tourney
                      </p>

                      <p className="text-xl font-extrabold">
                        {team.lastTournament}
                        {getTournamentHint(team, targetTeam)}
                      </p>
                    </div>

                    <div
                      className={`${getCellColor(result.tournamentAppearances)} flex min-h-20 flex-col items-center justify-center rounded-xl border border-[#0038A8]/30 p-2 text-center shadow-lg`}
                    >
                      <p className="mb-1 text-[9px] font-extrabold uppercase leading-tight tracking-wide">
                        Appearances
                      </p>

                      <p className="text-2xl font-extrabold">
                        {team.tournamentAppearances}
                        {getNumberHint(
                          team.tournamentAppearances,
                          targetTeam.tournamentAppearances,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showLogoHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#00152D] p-6 text-center shadow-xl">
            <button
              onClick={() => setShowLogoHint(false)}
              className="absolute right-4 top-3 text-2xl text-neutral-400 hover:text-white"
            >
              ×
            </button>

            <h2 className="mb-2 text-2xl font-bold">Logo Hint</h2>

            <div className="mx-auto flex h-72 w-72 items-center justify-center rounded-2xl border-4 border-[#0038A8] bg-[#E8D3A9] p-8 shadow-xl">
              <img
                src={targetTeam.logoUrl}
                alt="Team logo hint"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <button
              onClick={() => setShowLogoHint(false)}
              className="mt-6 rounded-lg bg-neutral-700 px-5 py-2 font-semibold hover:bg-neutral-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showHowToPlayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-md rounded-2xl border-4 border-[#0038A8] bg-[#00152D] p-6 text-left shadow-2xl">
            <button
              onClick={closeHowToPlay}
              className="absolute right-4 top-3 text-2xl text-neutral-400 hover:text-white"
            >
              ×
            </button>

            <h2 className="varsity mb-4 text-center text-4xl tracking-wider text-[#F76900]">
              HOW TO PLAY
            </h2>

            <div className="space-y-3 text-sm text-[#F5E6C8]">
              <p>
                Guess the daily D1 men&apos;s college basketball team in 8
                tries!
              </p>

              <p>
                After each guess, the tiles show how close your team is to the
                answer.
              </p>

              <p>
                Green means exact. Yellow means close or partially correct. Gray
                means incorrect.
              </p>

              <p>
                For State, yellow means the guessed team&apos;s state borders
                the answer&apos;s state.
              </p>

              <p>
                For Colors, yellow means the guessed team shares 1 color with
                the answer&apos;s 2 primary colors.
              </p>

              <p>
                For Titles, Last Tourney, and Appearances, arrows show whether
                the answer is higher or lower. If the arrow is yellow, it means
                it's within 2 of the guessed team&apos;s number.
              </p>

              <p>The Logo Hint unlocks after 4 guesses.</p>

              <p>Teams change at midnight EST!</p>
            </div>
            <button
              onClick={closeHowToPlay}
              className="mt-6 w-full rounded-lg bg-[#F76900] py-3 text-base font-extrabold uppercase tracking-wide text-white shadow-lg transition hover:bg-[#E05A00]"
            >
              Start Playing
            </button>
          </div>
        </div>
      )}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-sm rounded-2xl border-4 border-[#0038A8] bg-[#00152D] p-6 text-center shadow-2xl">
            <button
              onClick={() => setShowStatsModal(false)}
              className="absolute right-4 top-3 text-2xl text-neutral-400 hover:text-white"
            >
              ×
            </button>

            <h2 className="varsity mb-5 text-4xl tracking-wider text-[#F76900]">
              STATS
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#E8D3A9] p-4 text-[#00152D]">
                <p className="text-3xl font-extrabold">{stats.gamesPlayed}</p>
                <p className="text-xs font-bold uppercase">Played</p>
              </div>

              <div className="rounded-xl bg-[#E8D3A9] p-4 text-[#00152D]">
                <p className="text-3xl font-extrabold">{stats.wins}</p>
                <p className="text-xs font-bold uppercase">Wins</p>
              </div>

              <div className="rounded-xl bg-[#E8D3A9] p-4 text-[#00152D]">
                <p className="text-3xl font-extrabold">{stats.currentStreak}</p>
                <p className="text-xs font-bold uppercase">Current Streak</p>
              </div>

              <div className="rounded-xl bg-[#E8D3A9] p-4 text-[#00152D]">
                <p className="text-3xl font-extrabold">{stats.maxStreak}</p>
                <p className="text-xs font-bold uppercase">Max Streak</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
