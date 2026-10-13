import { caratsPerPull, incomeValues } from "@/constants";
import type { PlannerState, ProjectionResult } from "@/types";

export const calculateProjection = (
  state: PlannerState,
  targetDate: string
): ProjectionResult => {
  const now = new Date();
  const target = new Date(targetDate);
  const oneDay = 1000 * 60 * 60 * 24;

  const daysDiff = Math.max(
    0,
    Math.floor((target.getTime() - now.getTime()) / oneDay)
  );
  const monthsDiff = Math.floor(daysDiff / 30);

  let dailyIncome = 0;
  if (state.dailyLogin) {
    dailyIncome += incomeValues.dailyLogin;
  }
  if (state.dailyMissions) {
    dailyIncome += incomeValues.dailyMissions;
  }
  if (state.dailyPass) {
    dailyIncome += incomeValues.dailyPass;
  }

  let monthlyIncome = 0;
  monthlyIncome += state.clubRank;
  monthlyIncome += state.classRank;
  monthlyIncome += state.championMeeting;
  if (state.legendRaces) {
    monthlyIncome += incomeValues.legendRaces;
  }

  const totalCaratsFromDaily = dailyIncome * daysDiff;
  const totalCaratsFromMonthly = monthlyIncome * monthsDiff;

  const totalCarats =
    state.carats + totalCaratsFromDaily + totalCaratsFromMonthly;

  let monthlyTicketIncome = 0;
  if (state.silverCleats) {
    monthlyTicketIncome += incomeValues.silverCleats;
  }
  if (state.goldCleats) {
    monthlyTicketIncome += incomeValues.goldCleats;
  }
  if (state.rainbowCleats) {
    monthlyTicketIncome += incomeValues.rainbowCleats;
  }

  const totalTicketsFromMonthly = monthlyTicketIncome * monthsDiff;

  const ticketPulls =
    state.umaTickets + state.supportTickets + totalTicketsFromMonthly;
  const caratPulls = Math.floor(totalCarats / caratsPerPull);

  return {
    breakdown: {
      current: state.carats,
      dailyIncome: totalCaratsFromDaily,
      eventsIncome: 0,
      monthlyIncome: totalCaratsFromMonthly,
    },
    projectedDate: target,
    totalCarats,
    totalPulls: caratPulls + ticketPulls,
  };
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export type StatType =
  | "speed"
  | "stamina"
  | "power"
  | "guts"
  | "wit"
  | "friend";
export type TagKind = "stat" | "variant" | "collab";

export interface ParsedEntity {
  name: string;
  tag: string | null;
  tagKind: TagKind | null;
  stat: StatType | null;
}

export interface ParsedBannerName {
  entities: ParsedEntity[];
  isLaunch: boolean;
  isRerun: boolean;
}

const statAliases: Record<string, StatType> = {
  friend: "friend",
  guts: "guts",
  intelligence: "wit",
  power: "power",
  speed: "speed",
  stamina: "stamina",
  wit: "wit",
};

const parenPattern = /^(.+?)\s*\(([^)]+)\)\s*$/u;
const rerunPattern = /^\s*\[\s*re-?run\s*\]\s*/iu;

const classifyTag = (
  tag: string
): { tagKind: TagKind; stat: StatType | null } => {
  const lower = tag.toLowerCase();
  const stat = statAliases[lower];
  if (stat) {
    return { stat, tagKind: "stat" };
  }
  if (lower.includes("collab")) {
    return { stat: null, tagKind: "collab" };
  }
  return { stat: null, tagKind: "variant" };
};

export const parseBannerName = (name: string): ParsedBannerName => {
  const isRerun = rerunPattern.test(name);
  const stripped = name.replace(rerunPattern, "");
  const isLaunch = /launch banner/iu.test(stripped);
  const entities = stripped.split(/\s*&\s*/u).map((part): ParsedEntity => {
    const match = part.match(parenPattern);
    if (!match) {
      return { name: part.trim(), stat: null, tag: null, tagKind: null };
    }
    const [, base, tag] = match;
    const { tagKind, stat } = classifyTag(tag);
    return { name: base.trim(), stat, tag, tagKind };
  });
  return { entities, isLaunch, isRerun };
};
