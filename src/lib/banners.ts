import { StartKind, Type } from "@/types";
import type { BannerData, Character } from "@/types";

const resourceBase = "https://uma.moe/resources/current";
const assetBase = "https://uma.moe";
const cacheKey = "umaPlanner:banners:v3";
const cacheTtlMs = 6 * 60 * 60 * 1000;
const gzipMagic = [0x1f, 0x8b] as const;
const rerunTag = "rerun-banner";
const maxListedNames = 3;
const characterIdLength = 4;
const defaultSkin = "Original";
const maxNameWords = 4;
const piecePattern = /\bpiece\b/iu;

interface TimelineEvent {
  type: string;
  gacha_id: number;
  title: string;
  image_path: string;
  global_release_date: string;
  estimated_end_date: string | null;
  jp_release_date: string;
  is_confirmed: boolean;
  tags: string[];
  pickup_card_ids?: number[];
  related_characters?: string[];
  related_support_cards?: string[];
}

interface BannerTimeline {
  events: TimelineEvent[];
}

interface SupportCard {
  id: string;
  name: string;
  type: string;
}

type CharacterNames = Record<
  string,
  { name: string; skins: Record<string, string> }
>;

interface Catalogs {
  characters: CharacterNames;
  supports: Map<string, SupportCard>;
}

interface CachedBanners {
  savedAt: number;
  banners: BannerData[];
}

const isGzip = (bytes: Uint8Array) =>
  bytes[0] === gzipMagic[0] && bytes[1] === gzipMagic[1];

const fetchResource = async <T>(name: string): Promise<T> => {
  const response = await fetch(`${resourceBase}/${name}.json.gz`);
  if (!response.ok) {
    throw new Error(`Failed to load ${name}: ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!isGzip(bytes)) {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  }
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return (await new Response(stream).json()) as T;
};

const capitalize = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

const isCleanName = (name: string) =>
  !piecePattern.test(name) && name.split(" ").length <= maxNameWords;

const joinNames = (names: string[], fallback: string) => {
  const unique = [...new Set(names)];
  if (unique.length === 0) {
    return fallback;
  }
  const listed = unique.slice(0, maxListedNames).join(" & ");
  const hidden = unique.length - maxListedNames;
  return hidden > 0 ? `${listed} + ${hidden} more` : listed;
};

const relatedNames = (names: string[] | undefined) =>
  (names ?? []).filter(isCleanName);

const characterName = (event: TimelineEvent, characters: CharacterNames) => {
  if (!event.pickup_card_ids) {
    return joinNames(relatedNames(event.related_characters), event.title);
  }
  return joinNames(
    event.pickup_card_ids.flatMap((id) => {
      const cardId = String(id);
      const character = characters[cardId.slice(0, characterIdLength)];
      if (!character) {
        return [];
      }
      const skin = character.skins[cardId.slice(characterIdLength)];
      return skin && skin !== defaultSkin
        ? `${character.name} (${skin})`
        : character.name;
    }),
    event.title
  );
};

const supportName = (
  event: TimelineEvent,
  supports: Map<string, SupportCard>
) => {
  const related = event.related_support_cards ?? [];
  if (!event.pickup_card_ids) {
    return joinNames(relatedNames(related), event.title);
  }
  return joinNames(
    event.pickup_card_ids.flatMap((id, index) => {
      const card = supports.get(String(id));
      if (card) {
        return `${card.name} (${capitalize(card.type)})`;
      }
      return relatedNames([related[index] ?? ""]);
    }),
    event.title
  );
};

const toCharacter = (
  event: TimelineEvent,
  type: Type,
  name: string
): Character => ({
  end_date: event.is_confirmed ? event.estimated_end_date : null,
  est_end_date: event.estimated_end_date,
  id: event.gacha_id,
  image_path: `${assetBase}/${event.image_path}`,
  jp_release_date: event.jp_release_date,
  name: event.tags.includes(rerunTag) ? `[Rerun] ${name}` : name,
  start_date: event.global_release_date,
  start_kind: event.is_confirmed ? StartKind.Actual : StartKind.Est,
  type,
});

const toBanners = (
  timeline: BannerTimeline,
  catalogs: Catalogs
): BannerData[] => {
  const byDate = new Map<string, BannerData>();
  for (const event of timeline.events) {
    const isCharacter = event.type === "character_banner";
    if (!isCharacter && event.type !== "support_card_banner") {
      continue;
    }
    const date = event.global_release_date;
    const banner = byDate.get(date) ?? { characters: [], date, supports: [] };
    byDate.set(date, banner);
    if (isCharacter) {
      banner.characters.push(
        toCharacter(
          event,
          Type.Character,
          characterName(event, catalogs.characters)
        )
      );
    } else {
      banner.supports.push(
        toCharacter(event, Type.Support, supportName(event, catalogs.supports))
      );
    }
  }
  return [...byDate.values()];
};

const readCache = (): CachedBanners | null => {
  try {
    const raw = window.localStorage.getItem(cacheKey);
    return raw ? (JSON.parse(raw) as CachedBanners) : null;
  } catch {
    return null;
  }
};

const writeCache = (banners: BannerData[]) => {
  try {
    const entry: CachedBanners = { banners, savedAt: Date.now() };
    window.localStorage.setItem(cacheKey, JSON.stringify(entry));
    return true;
  } catch {
    return false;
  }
};

export const loadBanners = async (): Promise<BannerData[]> => {
  const cached = readCache();
  if (cached && Date.now() - cached.savedAt < cacheTtlMs) {
    return cached.banners;
  }
  try {
    const [timeline, characters, supports] = await Promise.all([
      fetchResource<BannerTimeline>("banner_timeline"),
      fetchResource<CharacterNames>("character_names"),
      fetchResource<SupportCard[]>("support-cards-db"),
    ]);
    const banners = toBanners(timeline, {
      characters,
      supports: new Map(supports.map((card) => [card.id, card])),
    });
    writeCache(banners);
    return banners;
  } catch (error) {
    if (cached) {
      return cached.banners;
    }
    throw error;
  }
};
