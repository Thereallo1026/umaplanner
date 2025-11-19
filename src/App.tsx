import { Icon } from "@iconify/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BannerCard } from "@/components/BannerCard";
import { Footer } from "@/components/Footer";
import { PlannerForm } from "@/components/PlannerForm";
import { SummaryWidget } from "@/components/SummaryWidget";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { BannerData, PlannerState } from "@/types";

const INITIAL_STATE: PlannerState = {
	carats: 0,
	umaTickets: 0,
	supportTickets: 0,
	clubRank: 4500,
	classRank: 1500,
	championMeeting: 2500,
	dailyLogin: true,
	dailyMissions: true,
	legendRaces: false,
	dailyPass: false,
	silverCleats: false,
	goldCleats: false,
	rainbowCleats: false,
};

export default function App() {
	const [state, setState] = useState<PlannerState>(INITIAL_STATE);
	const [searchTerm, setSearchTerm] = useState("");
	const [showMobileSettings, setShowMobileSettings] = useState(false);
	const [banners, setBanners] = useState<BannerData[]>([]);
	const [loading, setLoading] = useState(true);
	const [visibleEndDate, setVisibleEndDate] = useState<Date>(() => {
		const d = new Date();
		d.setMonth(d.getMonth() + 2);
		return d;
	});
	const observerTarget = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					"https://www.umaplanner.horse/api/banners",
				);
				if (!response.ok) {
					throw new Error(`Request failed with status ${response.status}`);
				}
				const json = await response.json();
				if (json.ok && json.data) {
					setBanners(json.data);
					setError(null);
				} else {
					throw new Error("Invalid API response format");
				}
			} catch (error) {
				console.error("Failed to fetch banners", error);
				setBanners([]);
				setError("Data not reachable.");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const filteredBanners = banners.filter((banner) => {
		const searchLower = searchTerm.toLowerCase();
		const hasCharacterMatch = banner.characters.some((c) =>
			c.name.toLowerCase().includes(searchLower),
		);
		const hasSupportMatch = banner.supports.some((s) =>
			s.name.toLowerCase().includes(searchLower),
		);
		return hasCharacterMatch || hasSupportMatch;
	});

	const now = new Date();

	const pastBanners = filteredBanners.filter((banner) => {
		const endDate = banner.characters[0].end_date;
		if (!endDate) return false;
		return new Date(endDate) < now;
	});

	const activeAndFutureBanners = filteredBanners.filter((banner) => {
		const endDate = banner.characters[0].end_date;
		if (!endDate) return true;
		return new Date(endDate) >= now;
	});

	const sortedActiveAndFutureBanners = activeAndFutureBanners.sort((a, b) => {
		const dateA = new Date(a.date).getTime();
		const dateB = new Date(b.date).getTime();
		return dateA - dateB;
	});

	const visibleBanners = sortedActiveAndFutureBanners.filter((banner) => {
		return new Date(banner.date) <= visibleEndDate;
	});

	const hasMore = visibleBanners.length < sortedActiveAndFutureBanners.length;

	const loadMore = useCallback(() => {
		if (!hasMore) return;
		setVisibleEndDate((prev) => {
			const next = new Date(prev);
			next.setMonth(next.getMonth() + 2);
			return next;
		});
	}, [hasMore]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMore();
				}
			},
			{ threshold: 0.1 },
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => observer.disconnect();
	}, [loadMore]);

	return (
		<div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-white selection:text-black">
			<SummaryWidget state={state} />

			<main className="flex-1 container mx-auto px-6 py-8 flex flex-col lg:flex-row gap-12 relative">
				<aside className="hidden lg:block w-[280px] shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pb-10 no-scrollbar">
					<div className="mb-8">
						<h2 className="text-lg font-semibold tracking-tight text-white">
							Configuration
						</h2>
						<p className="text-sm text-[#888]">
							Manage your resources and income.
						</p>
					</div>
					<PlannerForm state={state} onChange={setState} />
				</aside>

				{showMobileSettings && (
					<div className="fixed inset-0 z-60 lg:hidden">
						<button
							type="button"
							className="absolute inset-0 bg-black/80 backdrop-blur-sm border-0 p-0 cursor-pointer"
							onClick={() => setShowMobileSettings(false)}
							onKeyDown={(e) => {
								if (e.key === "Escape" || e.key === "Enter") {
									setShowMobileSettings(false);
								}
							}}
							aria-label="Close settings"
						/>
						<aside className="absolute right-0 top-0 bottom-0 w-[300px] bg-[#0A0A0A] border-l border-[#333] p-6 overflow-y-auto">
							<div className="flex justify-between items-center mb-8">
								<h2 className="text-lg font-semibold">Configuration</h2>
								<button
									onClick={() => setShowMobileSettings(false)}
									className="text-[#888] hover:text-white"
									type="button"
								>
									<Icon icon="mdi:close" width={20} />
								</button>
							</div>
							<PlannerForm state={state} onChange={setState} />
						</aside>
					</div>
				)}

				<div className="flex-1 min-w-0">
					<div className="mb-8 flex gap-3">
						<button
							onClick={() => setShowMobileSettings(true)}
							className="lg:hidden p-2.5 bg-[#111] border border-[#333] rounded-md text-white hover:bg-[#222]"
							type="button"
						>
							<Icon icon="mdi:cog" width={20} />
						</button>
						<div className="relative flex-1 group">
							<Icon
								icon="mdi:magnify"
								className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] group-focus-within:text-white transition-colors"
								width={16}
							/>
							<Input
								type="text"
								placeholder="Search for characters..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 bg-[#0A0A0A] border-[#333] text-white focus-visible:ring-0 focus-visible:border-white"
							/>
						</div>
						{pastBanners.length > 0 && (
							<Dialog>
								<DialogTrigger asChild>
									<button
										type="button"
										className="p-2.5 bg-[#111] border border-[#333] rounded-md text-white hover:bg-[#222] flex items-center gap-2 px-4"
									>
										<Icon icon="mdi:history" width={16} />
										<span className="hidden sm:inline text-sm">
											Past Banners
										</span>
									</button>
								</DialogTrigger>
								<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
									<DialogHeader>
										<DialogTitle>Past Banners</DialogTitle>
										<DialogDescription>
											View previous banners and their details.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-6 mt-4">
										{pastBanners.map((banner) => (
											<BannerCard
												key={`past-${banner.date}-${banner.characters[0]?.id}`}
												banner={banner}
												plannerState={state}
											/>
										))}
									</div>
								</DialogContent>
							</Dialog>
						)}
					</div>

					<div className="space-y-8">
						{loading ? (
							<div className="py-32 flex flex-col items-center justify-center text-[#444]">
								<Icon
									icon="mdi:loading"
									width={32}
									className="animate-spin mb-4"
								/>
								<p className="text-sm">Loading timeline...</p>
							</div>
						) : error ? (
							<div className="py-32 flex flex-col items-center justify-center text-[#444]">
								<Icon
									icon="mdi:alert-circle-outline"
									width={32}
									className="animate-spin mb-4"
								/>
								<p className="text-sm">Error: {error}</p>
							</div>
						) : visibleBanners.length > 0 ? (
							<>
								{visibleBanners.map((banner) => (
									<BannerCard
										key={`${banner.date}-${banner.characters[0]?.id}`}
										banner={banner}
										plannerState={state}
									/>
								))}
								{hasMore && (
									<div
										ref={observerTarget}
										className="py-12 flex flex-col items-center justify-center text-[#444] animate-pulse"
									>
										<p className="text-sm mb-2">Scroll to load more</p>
										<Icon icon="mdi:arrow-down" width={20} />
									</div>
								)}
							</>
						) : (
							<div className="py-32 flex flex-col items-center justify-center text-[#444] border border-dashed border-[#222] rounded-lg">
								<Icon
									icon="mdi:magnify"
									width={32}
									className="mb-4 opacity-50"
								/>
								<p className="text-sm">No results found</p>
							</div>
						)}
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
