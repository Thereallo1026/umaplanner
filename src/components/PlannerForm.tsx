import { Icon } from "@iconify/react";
import type React from "react";
import { Input } from "@/components/ui/input";
import {
	CHAMPION_MEETINGS,
	CLASS_RANKS,
	CLUB_RANKS,
	INCOME_VALUES,
} from "@/constants";
import type { PlannerState } from "@/types";

interface PlannerFormProps {
	state: PlannerState;
	onChange: (newState: PlannerState) => void;
}

const InputGroup = ({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) => (
	<div className="space-y-1.5">
		<span className="text-[11px] uppercase tracking-wider font-semibold text-[#666]">
			{label}
		</span>
		{children}
	</div>
);

const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
	<div className="relative">
		<select
			{...props}
			className="w-full appearance-none bg-[#0A0A0A] border border-[#333] rounded-md py-2 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-white focus:ring-0 transition-colors duration-200"
		/>
		<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
			<svg
				width="10"
				height="6"
				viewBox="0 0 10 6"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M1 1L5 5L9 1"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	</div>
);

const CheckboxItem = ({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) => (
	<label className="flex items-center justify-between group cursor-pointer py-2">
		<span className="text-sm text-[#888] group-hover:text-white transition-colors">
			{label}
		</span>
		<div
			className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
				checked
					? "bg-white border-white"
					: "bg-[#0A0A0A] border-[#333] group-hover:border-[#666]"
			}`}
		>
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="hidden"
			/>
			{checked && <Icon icon="mdi:check" width={10} className="text-black" />}
		</div>
	</label>
);

export const PlannerForm: React.FC<PlannerFormProps> = ({
	state,
	onChange,
}) => {
	const handleChange = (field: keyof PlannerState, value: number | boolean) => {
		onChange({ ...state, [field]: value });
	};

	return (
		<div className="space-y-8">
			<section className="space-y-4">
				<div className="flex items-center gap-2 text-white pb-2 border-b border-[#222]">
					<Icon icon="mdi:wallet" width={16} />
					<h2 className="text-sm font-medium">Resources</h2>
				</div>

				<div className="space-y-4">
					<InputGroup label="Current Carats">
						<div className="relative">
							<Icon
								icon="mdi:diamond-stone"
								width={14}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]"
							/>
							<Input
								type="number"
								value={state.carats || ""}
								onChange={(e) => handleChange("carats", Number(e.target.value))}
								placeholder="0"
								className="pl-9 pr-3 bg-[#0A0A0A] border-[#333] text-white focus-visible:ring-0 focus-visible:border-white"
							/>
						</div>
					</InputGroup>

					<div className="grid grid-cols-2 gap-3">
						<InputGroup label="Uma Tickets">
							<div className="relative">
								<Icon
									icon="mdi:ticket"
									width={14}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]"
								/>
								<Input
									type="number"
									value={state.umaTickets || ""}
									onChange={(e) =>
										handleChange("umaTickets", Number(e.target.value))
									}
									placeholder="0"
									className="pl-9 pr-3 bg-[#0A0A0A] border-[#333] text-white focus-visible:ring-0 focus-visible:border-white"
								/>
							</div>
						</InputGroup>
						<InputGroup label="Support Tickets">
							<div className="relative">
								<Icon
									icon="mdi:ticket"
									width={14}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]"
								/>
								<Input
									type="number"
									value={state.supportTickets || ""}
									onChange={(e) =>
										handleChange("supportTickets", Number(e.target.value))
									}
									placeholder="0"
									className="pl-9 pr-3 bg-[#0A0A0A] border-[#333] text-white focus-visible:ring-0 focus-visible:border-white"
								/>
							</div>
						</InputGroup>
					</div>
				</div>
			</section>

			<section className="space-y-4">
				<div className="flex items-center gap-2 text-white pb-2 border-b border-[#222]">
					<Icon icon="mdi:calendar" width={16} />
					<h2 className="text-sm font-medium">Monthly Income</h2>
				</div>

				<div className="space-y-4">
					<InputGroup label="Club Rank">
						<StyledSelect
							value={state.clubRank}
							onChange={(e) => handleChange("clubRank", Number(e.target.value))}
						>
							{CLUB_RANKS.map((opt) => (
								<option key={opt.label} value={opt.value}>
									{opt.label}
								</option>
							))}
						</StyledSelect>
					</InputGroup>

					<InputGroup label="Team Trials Class">
						<StyledSelect
							value={state.classRank}
							onChange={(e) =>
								handleChange("classRank", Number(e.target.value))
							}
						>
							{CLASS_RANKS.map((opt) => (
								<option key={opt.label} value={opt.value}>
									{opt.label}
								</option>
							))}
						</StyledSelect>
					</InputGroup>

					<InputGroup label="Champion's Meeting">
						<StyledSelect
							value={state.championMeeting}
							onChange={(e) =>
								handleChange("championMeeting", Number(e.target.value))
							}
						>
							{CHAMPION_MEETINGS.map((opt) => (
								<option key={opt.label} value={opt.value}>
									{opt.label}
								</option>
							))}
						</StyledSelect>
					</InputGroup>
				</div>
			</section>

			<section className="space-y-4">
				<div className="flex items-center gap-2 text-white pb-2 border-b border-[#222]">
					<Icon icon="mdi:trophy" width={16} />
					<h2 className="text-sm font-medium">Bonuses</h2>
				</div>

				<div className="space-y-1">
					<CheckboxItem
						label={`Daily Login (+${INCOME_VALUES.DAILY_LOGIN})`}
						checked={state.dailyLogin}
						onChange={(c) => handleChange("dailyLogin", c)}
					/>
					<CheckboxItem
						label={`Daily Missions (+${INCOME_VALUES.DAILY_MISSIONS})`}
						checked={state.dailyMissions}
						onChange={(c) => handleChange("dailyMissions", c)}
					/>
					<CheckboxItem
						label={`Daily Pass (+${INCOME_VALUES.DAILY_PASS})`}
						checked={state.dailyPass}
						onChange={(c) => handleChange("dailyPass", c)}
					/>
					<CheckboxItem
						label={`Legend Races (+${INCOME_VALUES.LEGEND_RACES}/mo)`}
						checked={state.legendRaces}
						onChange={(c) => handleChange("legendRaces", c)}
					/>
				</div>
			</section>

			<section className="space-y-4">
				<div className="flex items-center gap-2 text-white pb-2 border-b border-[#222]">
					<Icon icon="mdi:ticket" width={16} />
					<h2 className="text-sm font-medium">Monthly Passes</h2>
				</div>

				<div className="space-y-1">
					<CheckboxItem
						label={`Silver Cleats (+${INCOME_VALUES.SILVER_CLEATS} ticket)`}
						checked={state.silverCleats}
						onChange={(c) => handleChange("silverCleats", c)}
					/>
					<CheckboxItem
						label={`Gold Cleats (+${INCOME_VALUES.GOLD_CLEATS} tickets)`}
						checked={state.goldCleats}
						onChange={(c) => handleChange("goldCleats", c)}
					/>
					<CheckboxItem
						label={`Rainbow Cleats (+${INCOME_VALUES.RAINBOW_CLEATS} tickets)`}
						checked={state.rainbowCleats}
						onChange={(c) => handleChange("rainbowCleats", c)}
					/>
				</div>
			</section>
		</div>
	);
};
