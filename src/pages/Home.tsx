import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";

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
import { cn } from "@/lib/utils";
import type { BannerData, PlannerState } from "@/types";

const PLANNER_STATE_STORAGE_KEY = "umaPlanner:plannerState";

const INITIAL_STATE: PlannerState = {
  carats: 0,
  championMeeting: 2500,
  classRank: 1500,
  clubRank: 4500,
  dailyLogin: true,
  dailyMissions: true,
  dailyPass: false,
  goldCleats: false,
  legendRaces: false,
  rainbowCleats: false,
  silverCleats: false,
  supportTickets: 0,
  umaTickets: 0,
};

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

const sanitizePlannerState = (
  value: Partial<PlannerState>
): Partial<PlannerState> => ({
  carats: isNumber(value.carats) ? value.carats : undefined,
  championMeeting: isNumber(value.championMeeting)
    ? value.championMeeting
    : undefined,
  classRank: isNumber(value.classRank) ? value.classRank : undefined,
  clubRank: isNumber(value.clubRank) ? value.clubRank : undefined,
  dailyLogin: isBoolean(value.dailyLogin) ? value.dailyLogin : undefined,
  dailyMissions: isBoolean(value.dailyMissions)
    ? value.dailyMissions
    : undefined,
  dailyPass: isBoolean(value.dailyPass) ? value.dailyPass : undefined,
  goldCleats: isBoolean(value.goldCleats) ? value.goldCleats : undefined,
  legendRaces: isBoolean(value.legendRaces) ? value.legendRaces : undefined,
  rainbowCleats: isBoolean(value.rainbowCleats)
    ? value.rainbowCleats
    : undefined,
  silverCleats: isBoolean(value.silverCleats) ? value.silverCleats : undefined,
  supportTickets: isNumber(value.supportTickets)
    ? value.supportTickets
    : undefined,
  umaTickets: isNumber(value.umaTickets) ? value.umaTickets : undefined,
});

const getStoredPlannerState = (): PlannerState => {
  if (typeof window === "undefined") {
    return INITIAL_STATE;
  }
  const stored = window.localStorage.getItem(PLANNER_STATE_STORAGE_KEY);
  if (!stored) {
    return INITIAL_STATE;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      return INITIAL_STATE;
    }
    return { ...INITIAL_STATE, ...sanitizePlannerState(parsed) };
  } catch {
    return INITIAL_STATE;
  }
};

export default function Home() {
  const currentYear = new Date().getFullYear();

  const [state, setState] = useState<PlannerState>(() =>
    getStoredPlannerState()
  );
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
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(
        PLANNER_STATE_STORAGE_KEY,
        JSON.stringify(state)
      );
    } catch (error) {
      console.error("Failed to save planner settings", error);
    }
  }, [state]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://www.umaplanner.horse/api/banners"
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
      const hasCurrentYearData = banners.some(
        (b) => new Date(b.date).getFullYear() === currentYear
      );

      if (hasCurrentYearData) {
        setSelectedYear(currentYear);
      }
    }
  }, [banners, currentYear]);

  const years = useMemo(() => {
    if (!banners.length) {
      return [];
    }
    const uniqueYears = new Set(
      banners.map((b) => new Date(b.date).getFullYear())
    );
    // Filter out years before the current year
    return [...uniqueYears]
      .filter((year) => year >= currentYear)
      .toSorted((a, b) => a - b);
  }, [banners, currentYear]);

  const filteredBanners = banners.filter((banner) => {
    const searchLower = searchTerm.toLowerCase();
    const hasCharacterMatch = banner.characters.some((c) =>
      c.name.toLowerCase().includes(searchLower)
    );
    const hasSupportMatch = banner.supports.some((s) =>
      s.name.toLowerCase().includes(searchLower)
    );
    const matchesSearch = hasCharacterMatch || hasSupportMatch;

    if (selectedYear === "All") {
      return matchesSearch;
    }
    const bannerYear = new Date(banner.date).getFullYear();
    return matchesSearch && bannerYear === selectedYear;
  });

  const now = new Date();

  const pastBanners = filteredBanners.filter((banner) => {
    const endDate = banner.characters[0]?.end_date;
    if (!endDate) {
      return false;
    }
    return new Date(endDate) < now;
  });

  const activeAndFutureBanners = filteredBanners.filter((banner) => {
    const endDate = banner.characters[0]?.end_date;
    if (!endDate) {
      return true;
    }
    return new Date(endDate) >= now;
  });

  const sortedActiveAndFutureBanners = activeAndFutureBanners.toSorted(
    (a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    }
  );

  const visibleBanners =
    selectedYear === "All"
      ? sortedActiveAndFutureBanners.filter(
          (banner) => new Date(banner.date) <= visibleEndDate
        )
      : sortedActiveAndFutureBanners;

  const hasMore =
    selectedYear === "All" &&
    visibleBanners.length < sortedActiveAndFutureBanners.length;

  const loadMore = useCallback(() => {
    if (!hasMore) {
      return;
    }
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
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const renderTimeline = () => {
    if (loading) {
      return (
        <div className="py-32 flex flex-col items-center justify-center text-[#444]">
          <Icon icon="mdi:loading" width={32} className="animate-spin mb-4" />
          <p className="text-sm">Loading timeline...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="py-32 flex flex-col items-center justify-center text-[#444]">
          <Icon
            icon="mdi:alert-circle-outline"
            width={32}
            className="animate-spin mb-4"
          />
          <p className="text-sm">Error: {error}</p>
        </div>
      );
    }
    if (visibleBanners.length > 0) {
      return (
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
      );
    }
    return (
      <div className="py-32 flex flex-col items-center justify-center text-[#444] border border-dashed border-[#222] rounded-lg">
        <Icon icon="mdi:magnify" width={32} className="mb-4 opacity-50" />
        <p className="text-sm">No results found</p>
      </div>
    );
  };

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
                transition={{ damping: 25, stiffness: 200, type: "spring" }}
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
                  : "text-[#888] hover:text-white"
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
                    : "text-[#888] hover:text-white"
                )}
                type="button"
              >
                {year}
              </button>
            ))}
          </div>

          <div className="space-y-8">{renderTimeline()}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
