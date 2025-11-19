import { CARATS_PER_PULL, INCOME_VALUES } from "@/constants";
import type { PlannerState, ProjectionResult } from "@/types";

export const calculateProjection = (
	state: PlannerState,
	targetDate: string,
): ProjectionResult => {
	const now = new Date();
	const target = new Date(targetDate);
	const oneDay = 1000 * 60 * 60 * 24;

	const daysDiff = Math.max(
		0,
		Math.floor((target.getTime() - now.getTime()) / oneDay),
	);
	const monthsDiff = Math.floor(daysDiff / 30);

	let dailyIncome = 0;
	if (state.dailyLogin) dailyIncome += INCOME_VALUES.DAILY_LOGIN;
	if (state.dailyMissions) dailyIncome += INCOME_VALUES.DAILY_MISSIONS;
	if (state.dailyPass) dailyIncome += INCOME_VALUES.DAILY_PASS;

	let monthlyIncome = 0;
	monthlyIncome += state.clubRank;
	monthlyIncome += state.classRank;
	monthlyIncome += state.championMeeting;
	if (state.legendRaces) monthlyIncome += INCOME_VALUES.LEGEND_RACES;

	const totalCaratsFromDaily = dailyIncome * daysDiff;
	const totalCaratsFromMonthly = monthlyIncome * monthsDiff;

	const totalCarats =
		state.carats + totalCaratsFromDaily + totalCaratsFromMonthly;

	let monthlyTicketIncome = 0;
	if (state.silverCleats) monthlyTicketIncome += INCOME_VALUES.SILVER_CLEATS;
	if (state.goldCleats) monthlyTicketIncome += INCOME_VALUES.GOLD_CLEATS;
	if (state.rainbowCleats) monthlyTicketIncome += INCOME_VALUES.RAINBOW_CLEATS;

	const totalTicketsFromMonthly = monthlyTicketIncome * monthsDiff;

	const ticketPulls =
		state.umaTickets + state.supportTickets + totalTicketsFromMonthly;
	const caratPulls = Math.floor(totalCarats / CARATS_PER_PULL);

	return {
		totalCarats,
		totalPulls: caratPulls + ticketPulls,
		projectedDate: target,
		breakdown: {
			current: state.carats,
			dailyIncome: totalCaratsFromDaily,
			monthlyIncome: totalCaratsFromMonthly,
			eventsIncome: 0,
		},
	};
};

export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
};
