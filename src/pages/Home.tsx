import { Icon } from "@iconify/react";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { cn } from "@/lib/utils";

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

export default function Home() {
	const currentYear = new Date().getFullYear();

	const [state, setState] = useState<PlannerState>(INITIAL_STATE);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedYear, setSelectedYear] = useState<number | "All">(currentYear);
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

	useEffect(() => {
		if (banners.length > 0) {
			const currentYear = new Date().getFullYear();
			const hasCurrentYearData = banners.some(
				(b) => new Date(b.date).getFullYear() === currentYear,
			);

			if (hasCurrentYearData) {
				setSelectedYear(currentYear);
			}
		}
	}, [banners]);

	const years = useMemo(() => {
		if (!banners.length) return [];
		const uniqueYears = new Set(
			banners.map((b) => new Date(b.date).getFullYear()),
		);
		// Filter out years before the current year
		return Array.from(uniqueYears)
			.filter((year) => year >= currentYear)
			.sort((a, b) => a - b);
	}, [banners, currentYear]);

	const filteredBanners = banners.filter((banner) => {
		const searchLower = searchTerm.toLowerCase();
		const hasCharacterMatch = banner.characters.some((c) =>
			c.name.toLowerCase().includes(searchLower),
		);
		const hasSupportMatch = banner.supports.some((s) =>
			s.name.toLowerCase().includes(searchLower),
		);
		const matchesSearch = hasCharacterMatch || hasSupportMatch;

		if (selectedYear === "All") return matchesSearch;
		const bannerYear = new Date(banner.date).getFullYear();
		return matchesSearch && bannerYear === selectedYear;
	});

	const now = new Date();

	const pastBanners = filteredBanners.filter((banner) => {
		const endDate = banner.characters[0]?.end_date;
		if (!endDate) return false;
		return new Date(endDate) < now;
	});

	const activeAndFutureBanners = filteredBanners.filter((banner) => {
		const endDate = banner.characters[0]?.end_date;
		if (!endDate) return true;
		return new Date(endDate) >= now;
	});

	const sortedActiveAndFutureBanners = activeAndFutureBanners.sort((a, b) => {
		const dateA = new Date(a.date).getTime();
		const dateB = new Date(b.date).getTime();
		return dateA - dateB;
	});

	const visibleBanners =
		selectedYear === "All"
			? sortedActiveAndFutureBanners.filter((banner) => {
					return new Date(banner.date) <= visibleEndDate;
				})
			: sortedActiveAndFutureBanners;

	const hasMore =
		selectedYear === "All" &&
		visibleBanners.length < sortedActiveAndFutureBanners.length;

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

			<AnimatePresence>
				{showMobileSettings && (
					<div className="fixed inset-0 z-60 lg:hidden isolate">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="absolute inset-0 bg-black/80 backdrop-blur-sm"
							onClick={() => setShowMobileSettings(false)}
							aria-hidden="true"
						/>

						<motion.aside
							initial={{ x: "-100%" }}
							animate={{ x: 0 }}
							exit={{ x: "-100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="absolute left-0 top-0 bottom-0 w-[300px] bg-[#0A0A0A] border-r border-[#333] p-6 overflow-y-auto shadow-2xl"
						>
							<div className="flex justify-between items-center mb-8">
								<h2 className="text-lg font-semibold">Configuration</h2>
								<button
									onClick={() => setShowMobileSettings(false)}
									className="text-[#888] hover:text-white transition-colors"
									type="button"
								>
									<Icon icon="mdi:close" width={24} />
								</button>
							</div>
							<PlannerForm state={state} onChange={setState} />
						</motion.aside>
					</div>
				)}
			</AnimatePresence>

				<div className="flex-1 min-w-0">
					<div className="mb-4 flex gap-3">
						<button
							onClick={() => setShowMobileSettings(true)}
							className="lg:hidden p-2.5 bg-[#111] border border-[#333] rounded-md text-white hover:bg-[#222] transition-colors"
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
										className="p-2.5 bg-[#111] border border-[#333] rounded-md text-white hover:bg-[#222] transition-colors flex items-center gap-2 px-4"
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

					<div className="flex flex-wrap items-center gap-2 mb-6">
						<button
							onClick={() => setSelectedYear("All")}
							className={cn(
								"px-4 py-1.5 rounded-full text-sm transition-colors cursor-pointer",
								selectedYear === "All"
									? "bg-white text-black font-medium"
									: "text-[#888] hover:text-white",
							)}
							type="button"
						>
							All
						</button>
						<div className="h-4 w-px bg-[#333] mx-1" />
						{years.map((year) => (
							<button
								key={year}
								onClick={() => setSelectedYear(year)}
								className={cn(
									"px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer",
									selectedYear === year
										? "bg-white text-black font-semibold"
										: "text-[#888] hover:text-white",
								)}
								type="button"
							>
								{year}
							</button>
						))}
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

