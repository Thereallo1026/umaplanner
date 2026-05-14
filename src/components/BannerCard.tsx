import { Icon } from "@iconify/react";
import React from "react";

import type { BannerData, PlannerState } from "@/types";
import type { ParsedEntity, StatType } from "@/utils";
import { calculateProjection, formatDate, parseBannerName } from "@/utils";

const STAT_COLORS: Record<StatType, string> = {
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
      className={`inline-flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 rounded-full ring-1 ${STAT_COLORS[stat]}`}
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

const ParsedName = ({ name }: { name: string }) => {
  const { entities, isRerun } = parseBannerName(name);
  return (
    <p className="text-xs font-medium leading-tight flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {isRerun && (
        <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
          Rerun
        </span>
      )}
      {entities.map((entity, i) => (
        <React.Fragment key={`${entity.name}-${i}`}>
          {i > 0 && <span className="text-[#444]">+</span>}
          <EntityLabel entity={entity} />
        </React.Fragment>
      ))}
    </p>
  );
};

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
          ? `https://picsum.photos/seed/${alt.replaceAll(" ", "")}/512/189`
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

  const [firstChar] = banner.characters;
  const endDate = firstChar?.end_date;
  const estEndDate = firstChar?.est_end_date;
  const effectiveEndDate = endDate ?? estEndDate;
  const isEstimatedEnd = !endDate && Boolean(estEndDate);
  const isPast = effectiveEndDate ? new Date(effectiveEndDate) < now : false;
  const isCurrent = effectiveEndDate
    ? startDate <= now && new Date(effectiveEndDate) >= now
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
                  <ParsedName name={char.name} />
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
                  <ParsedName name={supp.name} />
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
