/** CropFort marketing / landing design tokens */
export const cf = {
  forest: "#12372A",
  green: "#3A6B35",
  sage: "#84A95C",
  earth: "#B58A5A",
  bg: "#F7F8F4",
  white: "#FFFFFF",
  text: "#17201B",
  muted: "#66736B",
  border: "#DDE3DC",
} as const;

export type HeroSlide = {
  src: string;
  position: string;
  label: string;
};

/** Cinematic aerial / estate photography for hero carousel */
export const HERO_IMAGES: readonly HeroSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1653007574493-edad758220d8?auto=format&fit=crop&w=2400&q=85",
    position: "center 45%",
    label: "Coffee estate hillside",
  },
  {
    src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=85",
    position: "center 40%",
    label: "Managed agricultural landscape",
  },
  {
    src: "https://images.unsplash.com/photo-1649039999826-7e125f996907?auto=format&fit=crop&w=2400&q=85",
    position: "center 42%",
    label: "Farm valley overview",
  },
  {
    src: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2400&q=85",
    position: "center 38%",
    label: "Field operations",
  },
  {
    src: "https://images.unsplash.com/photo-1642613630414-1d9938f4fe02?auto=format&fit=crop&w=2400&q=85",
    position: "center 35%",
    label: "Harvest on the estate",
  },
] as const;

export const HERO_IMAGE = HERO_IMAGES[0].src;

export const CTA_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=85";

export const FIELD_IMAGE =
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80";
