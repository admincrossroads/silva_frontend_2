const THEME_VARS = [
  "--primary",
  "--primary-foreground",
  "--ring",
  "--accent",
  "--accent-foreground",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-accent",
  "--sidebar-border",
  "--sidebar-brand",
  "--sidebar-brand-foreground",
  "--tenant-accent",
] as const;

const DEFAULTS: Record<(typeof THEME_VARS)[number], string> = {
  "--primary": "152 55% 28%",
  "--primary-foreground": "0 0% 100%",
  "--ring": "152 55% 28%",
  "--accent": "152 22% 90%",
  "--accent-foreground": "160 28% 14%",
  "--sidebar": "165 32% 10%",
  "--sidebar-foreground": "150 20% 94%",
  "--sidebar-accent": "165 24% 16%",
  "--sidebar-border": "165 20% 18%",
  "--sidebar-brand": "152 70% 72%",
  "--sidebar-brand-foreground": "152 70% 72%",
  "--tenant-accent": "#166534",
};

type Hsl = { h: number; s: number; l: number };

function parseHex(hex: string): Hsl | null {
  const normalized = hex.trim().replace("#", "");
  if (!/^[\da-f]{6}$/i.test(normalized)) return null;

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 152, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  h /= 6;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function fmt({ h, s, l }: Hsl): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function adjust(hsl: Hsl, deltaL: number, deltaS = 0): Hsl {
  return {
    h: hsl.h,
    s: clamp(hsl.s + deltaS, 0, 100),
    l: clamp(hsl.l + deltaL, 8, 92),
  };
}

function foregroundFor(hsl: Hsl): string {
  return hsl.l > 58 ? "160 28% 12%" : "0 0% 100%";
}

export function resolveWorkspaceColor(
  tenantColor?: string | null,
  programColor?: string | null,
): string | null {
  const color = tenantColor || programColor;
  if (!color) return null;
  return parseHex(color) ? color : null;
}

export function applyWorkspaceTheme(color: string | null, isDark = false) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (!color) {
    resetWorkspaceTheme();
    return;
  }

  const base = parseHex(color);
  if (!base) {
    resetWorkspaceTheme();
    return;
  }

  const primary = adjust(base, isDark ? 8 : 0, isDark ? -4 : 0);
  const ring = primary;
  const accent = adjust(base, isDark ? -28 : 32, isDark ? -18 : -24);
  const sidebarBrand = adjust(base, 28, 4);
  const sidebarBrandFg = adjust(base, 34, 6);

  const sidebarBg: Hsl = {
    h: base.h,
    s: clamp(base.s * 0.55 + 12, 22, 52),
    l: isDark ? 7 : 11,
  };
  const sidebarAccent = adjust(sidebarBg, 5, 3);
  const sidebarBorder = adjust(sidebarBg, 9, 1);
  const sidebarForeground: Hsl = { h: base.h, s: 18, l: 94 };

  root.style.setProperty("--primary", fmt(primary));
  root.style.setProperty("--primary-foreground", foregroundFor(primary));
  root.style.setProperty("--ring", fmt(ring));
  root.style.setProperty("--accent", fmt(accent));
  root.style.setProperty("--accent-foreground", fmt(adjust(base, isDark ? 30 : -32)));
  root.style.setProperty("--sidebar", fmt(sidebarBg));
  root.style.setProperty("--sidebar-foreground", fmt(sidebarForeground));
  root.style.setProperty("--sidebar-accent", fmt(sidebarAccent));
  root.style.setProperty("--sidebar-border", fmt(sidebarBorder));
  root.style.setProperty("--sidebar-brand", fmt(sidebarBrand));
  root.style.setProperty("--sidebar-brand-foreground", fmt(sidebarBrandFg));
  root.style.setProperty("--tenant-accent", color);
}

export function resetWorkspaceTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const key of THEME_VARS) {
    root.style.setProperty(key, DEFAULTS[key]);
  }
}

export function clearWorkspaceThemeOverrides() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const key of THEME_VARS) {
    root.style.removeProperty(key);
  }
}
