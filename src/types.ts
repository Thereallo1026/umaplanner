export enum Type {
	Character = "character",
	Support = "support",
}

export enum StartKind {
	Actual = "actual",
	Est = "est",
}

export interface Character {
	id: number;
	type: Type;
	name: string;
	image_path: string;
	start_date: string;
	start_kind: StartKind;
	end_date: string | null;
	est_end_date: string | null;
	jp_release_date: string;
	jp_days_until_next: number;
	global_days_until_next: number | null;
}

export interface BannerData {
	date: string;
	characters: Character[];
	supports: Character[];
}

export interface PlannerState {
	carats: number;
	umaTickets: number;
	supportTickets: number;
	clubRank: number;
	classRank: number;
	championMeeting: number;
	dailyLogin: boolean;
	legendRaces: boolean;
	dailyMissions: boolean;
	dailyPass: boolean;
	silverCleats: boolean;
	goldCleats: boolean;
	rainbowCleats: boolean;
}

export interface ProjectionResult {
	totalCarats: number;
	totalPulls: number;
	projectedDate: Date;
	breakdown: {
		current: number;
		dailyIncome: number;
		monthlyIncome: number;
		eventsIncome: number;
	};
}
