import { CARATS_PER_PULL, INCOME_VALUES } from "@/constants";
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
    dailyIncome += INCOME_VALUES.DAILY_LOGIN;
  }
  if (state.dailyMissions) {
    dailyIncome += INCOME_VALUES.DAILY_MISSIONS;
  }
  if (state.dailyPass) {
    dailyIncome += INCOME_VALUES.DAILY_PASS;
  }

  let monthlyIncome = 0;
  monthlyIncome += state.clubRank;
  monthlyIncome += state.classRank;
  monthlyIncome += state.championMeeting;
  if (state.legendRaces) {
    monthlyIncome += INCOME_VALUES.LEGEND_RACES;
  }

  const totalCaratsFromDaily = dailyIncome * daysDiff;
  const totalCaratsFromMonthly = monthlyIncome * monthsDiff;

  const totalCarats =
    state.carats + totalCaratsFromDaily + totalCaratsFromMonthly;

  let monthlyTicketIncome = 0;
  if (state.silverCleats) {
    monthlyTicketIncome += INCOME_VALUES.SILVER_CLEATS;
  }
  if (state.goldCleats) {
    monthlyTicketIncome += INCOME_VALUES.GOLD_CLEATS;
  }
  if (state.rainbowCleats) {
    monthlyTicketIncome += INCOME_VALUES.RAINBOW_CLEATS;
  }

  const totalTicketsFromMonthly = monthlyTicketIncome * monthsDiff;

  const ticketPulls =
    state.umaTickets + state.supportTickets + totalTicketsFromMonthly;
  const caratPulls = Math.floor(totalCarats / CARATS_PER_PULL);

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

const STAT_ALIASES: Record<string, StatType> = {
  friend: "friend",
  guts: "guts",
  intelligence: "wit",
  power: "power",
  speed: "speed",
  stamina: "stamina",
  wit: "wit",
};

const PAREN_RE = /^(.+?)\s*\(([^)]+)\)\s*$/u;
const RERUN_RE = /^\s*\[\s*re-?run\s*\]\s*/iu;

const classifyTag = (
  tag: string
): { tagKind: TagKind; stat: StatType | null } => {
  const lower = tag.toLowerCase();
  const stat = STAT_ALIASES[lower];
  if (stat) {
    return { stat, tagKind: "stat" };
  }
  if (lower.includes("collab")) {
    return { stat: null, tagKind: "collab" };
  }
  return { stat: null, tagKind: "variant" };
};

export const parseBannerName = (name: string): ParsedBannerName => {
  const isRerun = RERUN_RE.test(name);
  const stripped = name.replace(RERUN_RE, "");
  const isLaunch = /launch banner/iu.test(stripped);
  const entities = stripped.split(/\s*&\s*/u).map((part): ParsedEntity => {
    const match = part.match(PAREN_RE);
    if (!match) {
      return { name: part.trim(), stat: null, tag: null, tagKind: null };
    }
    const [, base, tag] = match;
    const { tagKind, stat } = classifyTag(tag);
    return { name: base.trim(), stat, tag, tagKind };
  });
  return { entities, isLaunch, isRerun };
};
