import { Icon } from "@iconify/react";
import NumberFlow from "@number-flow/react";
import type React from "react";
import { CARATS_PER_PULL } from "@/constants";
import type { PlannerState } from "@/types";

export const SummaryWidget: React.FC<{ state: PlannerState }> = ({ state }) => {
	const totalPulls =
		Math.floor(state.carats / CARATS_PER_PULL) +
		state.umaTickets +
		state.supportTickets;

	return (
		<div className="sticky top-0 z-50 border-b border-[#333] bg-black/80 backdrop-blur-md supports-backdrop-filter:bg-black/60">
			<div className="container mx-auto px-6 h-14 flex justify-between items-center">
				<div className="flex items-center gap-2">
					<img src="/logo.svg" alt="Logo" className="h-8 w-8" />
					<span className="font-semibold text-xl tracking-tight text-white">
						Umaplanner
					</span>
				</div>

				<div className="flex items-center gap-6 sm:gap-8">
					<div className="flex flex-col items-end sm:flex-row sm:items-center sm:gap-3">
						<span className="text-[10px] uppercase tracking-wider text-[#888] font-medium">
							Carats
						</span>
						<div className="flex items-center gap-2 text-white font-mono text-sm">
							<Icon
								icon="mdi:diamond-stone"
								width={14}
								className="text-[#888]"
							/>
							<NumberFlow value={state.carats} />
						</div>
					</div>

					<div className="h-4 w-px bg-[#333] hidden sm:block"></div>

					<div className="flex flex-col items-end sm:flex-row sm:items-center sm:gap-3">
						<span className="text-[10px] uppercase tracking-wider text-[#888] font-medium">
							Est. Pulls
						</span>
						<div className="flex items-center gap-2 text-white font-mono text-sm">
							<Icon icon="mdi:ticket" width={14} className="text-white" />
							<NumberFlow value={totalPulls} className="font-bold" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
