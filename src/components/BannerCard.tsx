import { Icon } from "@iconify/react";
import React from "react";

import type { BannerData, Character, PlannerState } from "@/types";
import type { ParsedEntity, StatType } from "@/utils";
import { calculateProjection, formatDate, parseBannerName } from "@/utils";

const statColors: Record<StatType, string> = {
  friend: "bg-[#f5c542]/15 ring-[#f5c542]/40 text-[#f5c542]",
  guts: "bg-[#ef8ec0]/15 ring-[#ef8ec0]/40 text-[#ef8ec0]",
  power: "bg-[#f49f3f]/15 ring-[#f49f3f]/40 text-[#f49f3f]",
  speed: "bg-[#48b1ea]/15 ring-[#48b1ea]/40 text-[#48b1ea]",
  stamina: "bg-[#e9686f]/15 ring-[#e9686f]/40 text-[#e9686f]",
  wit: "bg-[#5fbe96]/15 ring-[#5fbe96]/40 text-[#5fbe96]",
};

const StatBadge = ({ stat }: { stat: StatType }) => {
  const label = stat[0].toUpperCase() + stat.slice(1);
  return (
    <span
      className={`inline-flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 rounded-full ring-1 ${statColors[stat]}`}
    >
      <img
        src={`/images/stats/${stat}.png`}
        alt=""
        className="w-3.5 h-3.5 rounded-full object-cover"
        loading="lazy"
      />
      <span className="text-[9px] font-semibold uppercase tracking-wider">
        {label}
      </span>
    </span>
  );
};

const isGroupTag = (tag: string) => tag.toLowerCase() === "group";

const GroupBadge = () => (
  <span className="inline-flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 rounded-full ring-1 bg-[#4FD108]/15 ring-[#4FD108]/40 text-[#4FD108]">
    <img
      src="/images/stats/group.png"
      alt=""
      className="w-3.5 h-3.5 rounded-full object-cover"
      loading="lazy"
    />
    <span className="text-[9px] font-semibold uppercase tracking-wider">
      Group
    </span>
  </span>
);

const EntityLabel = ({ entity }: { entity: ParsedEntity }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="text-white/90">{entity.name}</span>
    {entity.stat && <StatBadge stat={entity.stat} />}
    {entity.tag && entity.tagKind !== "stat" && isGroupTag(entity.tag) && (
      <GroupBadge />
    )}
    {entity.tag && entity.tagKind !== "stat" && !isGroupTag(entity.tag) && (
      <span
        className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
          entity.tagKind === "collab"
            ? "bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-500/30"
            : "bg-white/5 text-[#888] ring-1 ring-white/10"
        }`}
      >
        {entity.tag}
      </span>
    )}
  </span>
);

const RerunBadge = () => (
  <span className="w-fit text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
    Rerun
  </span>
);

const ParsedName = ({ name }: { name: string }) => {
  const { entities, isRerun, moreCount } = parseBannerName(name);
  return (
    <p className="text-xs font-medium leading-tight flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {isRerun && <RerunBadge />}
      {entities.map((entity, i) => (
        <React.Fragment key={`${entity.name}-${i}`}>
          {i > 0 && <span className="text-[#444]">+</span>}
          <EntityLabel entity={entity} />
        </React.Fragment>
      ))}
      {moreCount > 0 && (
        <>
          <span className="text-[#444]">+</span>
          <span className="text-[#888]">{moreCount} more</span>
        </>
      )}
    </p>
  );
};

const StackedName = ({ name }: { name: string }) => {
  const { entities, isRerun, moreCount } = parseBannerName(name);
  return (
    <div className="flex flex-col gap-2 text-base font-medium leading-tight">
      {isRerun && <RerunBadge />}
      {entities.map((entity, i) => (
        <EntityLabel key={`${entity.name}-${i}`} entity={entity} />
      ))}
      {moreCount > 0 && (
        <span className="text-sm text-[#888]">+ {moreCount} more</span>
      )}
    </div>
  );
};

interface BannerCardProps {
  banner: BannerData;
  plannerState: PlannerState;
}

const getOptimizedImageUrl = (url: string) =>
  `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp`;

const BannerImage = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = React.useState(false);

  if (error) {
    return (
      <div className="w-full aspect-512/200 rounded-sm border border-dashed border-white/20 bg-white/5" />
    );
  }

  return (
    <div className="w-full bg-[#111] rounded-sm overflow-hidden border border-[#222] group-hover/image:border-[#444] transition-colors">
      <img
        src={getOptimizedImageUrl(src)}
        alt={alt}
        className="block w-full h-auto"
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};

const SectionTitle = ({ icon, title }: { icon: string; title: string }) => (
  <h3 className="text-[10px] uppercase tracking-widest text-[#666] font-semibold flex items-center gap-1">
    <Icon icon={icon} width={10} /> {title}
  </h3>
);

const BannerSection = ({
  icon,
  title,
  items,
  isWide,
}: {
  icon: string;
  title: string;
  items: Character[];
  isWide: boolean;
}) => (
  <div className="p-4 space-y-3">
    <SectionTitle icon={icon} title={title} />
    <div className="space-y-3">
      {items.map((item) =>
        isWide ? (
          <div
            key={item.id}
            className="grid md:grid-cols-2 gap-3 md:gap-6 md:items-center"
          >
            <BannerImage src={item.image_path} alt={item.name} />
            <StackedName name={item.name} />
          </div>
        ) : (
          <div key={item.id} className="space-y-2">
            <BannerImage src={item.image_path} alt={item.name} />
            <ParsedName name={item.name} />
          </div>
        )
      )}
    </div>
  </div>
);

const getBannerTiming = (banner: BannerData) => {
  const now = new Date();
  const startDate = new Date(banner.date);
  const [lead = banner.supports[0]] = banner.characters;
  const endDate = lead?.end_date;
  const effectiveEndDate = endDate ?? lead?.est_end_date;
  const end = effectiveEndDate ? new Date(effectiveEndDate) : null;
  return {
    effectiveEndDate,
    isCurrent: startDate <= now && (!end || end >= now),
    isEstimatedEnd: !endDate && Boolean(effectiveEndDate),
    isPast: end ? end < now : false,
    lead,
  };
};

export const BannerCard: React.FC<BannerCardProps> = ({
  banner,
  plannerState,
}) => {
  const projection = calculateProjection(plannerState, banner.date);
  const hasBoth = banner.characters.length > 0 && banner.supports.length > 0;
  const { lead, effectiveEndDate, isEstimatedEnd, isPast, isCurrent } =
    getBannerTiming(banner);

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
            {formatDate(lead?.start_date || banner.date)}
          </span>
          <Icon icon="mdi:arrow-right" width={10} className="text-[#444]" />
          <span>
            {effectiveEndDate ? formatDate(effectiveEndDate) : "???"}
            {isEstimatedEnd && <span className="ml-1 text-[#555]">(est)</span>}
          </span>
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

      <div
        className={`grid divide-y md:divide-y-0 md:divide-x divide-[#222] ${
          hasBoth ? "md:grid-cols-2" : ""
        }`}
      >
        {banner.characters.length > 0 && (
          <BannerSection
            icon="mdi:star"
            title="Character"
            items={banner.characters}
            isWide={!hasBoth}
          />
        )}
        {banner.supports.length > 0 && (
          <BannerSection
            icon="mdi:lightning-bolt"
            title="Support"
            items={banner.supports}
            isWide={!hasBoth}
          />
        )}
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
