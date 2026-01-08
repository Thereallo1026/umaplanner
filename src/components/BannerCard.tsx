import { Icon } from "@iconify/react";
import React from "react";
import type { BannerData, PlannerState } from "@/types";
import { calculateProjection, formatDate } from "@/utils";

interface BannerCardProps {
	banner: BannerData;
	plannerState: PlannerState;
}

const getOptimizedImageUrl = (path: string) => {
	const baseUrl = "https://www.umaplanner.horse";
	const fullUrl = path.startsWith("http") ? path : `${baseUrl}${path}`;
	return `https://wsrv.nl/?url=${encodeURIComponent(fullUrl)}&output=webp`;
};

const ImageWithFallback = ({
	src,
	alt,
	className,
}: {
	src: string;
	alt: string;
	className?: string;
}) => {
	const [error, setError] = React.useState(false);
	const optimizedSrc = getOptimizedImageUrl(src);

	return (
		<img
			src={
				error
					? `https://picsum.photos/seed/${alt.replace(/ /g, "")}/512/189`
					: optimizedSrc
			}
			alt={alt}
			className={className}
			onError={() => setError(true)}
			loading="lazy"
		/>
	);
};

export const BannerCard: React.FC<BannerCardProps> = ({
	banner,
	plannerState,
}) => {
	const projection = calculateProjection(plannerState, banner.date);
	const now = new Date();
	const startDate = new Date(banner.date);

	const endDate = banner.characters[0]?.end_date;
	const isPast = endDate ? new Date(endDate) < now : false;
	const isCurrent = endDate
		? startDate <= now && new Date(endDate) >= now
		: startDate <= now;

	return (
		<div
			className={`group relative bg-black border rounded-lg transition-all duration-200 overflow-hidden ${
				isCurrent
					? "border-white shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)]"
					: "border-[#333] hover:border-[#666]"
			} ${isPast ? "opacity-40 grayscale" : ""}`}
		>
			<div className="px-4 py-3 border-b border-[#222] flex items-center justify-between bg-[#050505]">
				<div className="flex items-center gap-3 text-xs font-mono text-[#888]">
					<Icon icon="mdi:calendar" width={12} />
					<span className={isCurrent ? "text-white font-bold" : ""}>
						{formatDate(banner.characters[0]?.start_date || banner.date)}
					</span>
					<Icon icon="mdi:arrow-right" width={10} className="text-[#444]" />
					<span>{endDate ? formatDate(endDate) : "???"}</span>
				</div>
				{isCurrent && (
					<div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-white text-black text-[10px] font-bold uppercase tracking-wide">
						<span className="relative flex h-1.5 w-1.5">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
							<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black"></span>
						</span>
						Live
					</div>
				)}
			</div>

			<div className="p-0">
				<div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#222]">
					<div className="p-4 space-y-3">
						<h3 className="text-[10px] uppercase tracking-widest text-[#666] font-semibold flex items-center gap-1">
							<Icon icon="mdi:star" width={10} /> Character
						</h3>
						<div className="space-y-3">
							{banner.characters.map((char) => (
								<div key={char.id} className="space-y-2">
									<div className="w-full aspect-512/189 bg-[#111] rounded-sm overflow-hidden border border-[#222] group-hover/image:border-[#444] transition-colors">
										<ImageWithFallback
											src={char.image_path}
											alt={char.name}
											className="w-full h-full object-cover"
										/>
									</div>
									<p className="text-xs font-medium text-white/90 leading-tight">
										{char.name}
									</p>
								</div>
							))}
						</div>
					</div>

					<div className="p-4 space-y-3">
						<h3 className="text-[10px] uppercase tracking-widest text-[#666] font-semibold flex items-center gap-1">
							<Icon icon="mdi:lightning-bolt" width={10} /> Support
						</h3>
						<div className="space-y-3">
							{banner.supports.map((supp) => (
								<div key={supp.id} className="space-y-2">
									<div className="w-full aspect-512/189 bg-[#111] rounded-sm overflow-hidden border border-[#222] group-hover/image:border-[#444] transition-colors">
										<ImageWithFallback
											src={supp.image_path}
											alt={supp.name}
											className="w-full h-full object-cover"
										/>
									</div>
									<p className="text-xs font-medium text-white/90 leading-tight">
										{supp.name}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{!isPast && (
				<div className="border-t border-[#222] bg-[#080808] px-4 py-3 flex justify-between items-center">
					<span className="text-[10px] text-[#666] font-medium uppercase tracking-wider">
						Projection
					</span>

					<div className="flex items-center gap-4 text-xs font-mono">
						<div className="flex items-center gap-1.5 text-[#888]">
							<span>{projection.totalCarats.toLocaleString()}</span>
							<span className="text-[#444]">carats</span>
						</div>
						<div className="flex items-center gap-1.5 text-white">
							<span className="font-bold">
								{projection.totalPulls.toLocaleString()}
							</span>
							<span className="text-[#666]">pulls</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
