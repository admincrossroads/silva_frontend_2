import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";

type BrandLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withWordmark?: boolean;
  /** When withWordmark, show "by SPX Africa" under the name */
  showTagline?: boolean;
  tone?: "default" | "inverse" | "sidebar";
  wordmarkClassName?: string;
  titleClassName?: string;
};

const sizeMap = {
  sm: { box: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  md: { box: "h-9 w-9 rounded-xl", icon: "h-[1.15rem] w-[1.15rem]" },
  lg: { box: "h-11 w-11 rounded-xl", icon: "h-5 w-5" },
  xl: { box: "h-14 w-14 rounded-2xl", icon: "h-7 w-7" },
} as const;

/**
 * Farm OS mark — SPX Africa spiral growing from a farm stem.
 * Spiral = brand mark; stem + field line = estate / farm.
 */
export function SpxFarmMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M4.5 27c3.5-1.7 7.4-2.5 11.5-2.5S24 25.3 27.5 27"
        stroke="currentColor"
        strokeOpacity="0.38"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M16 24.8V17.2"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M16 17.1
           c1.55 0 2.75-1.2 2.75-2.65
           0-2.15-1.8-3.85-4.05-3.85
           -2.95 0-5.2 2.45-5.2 5.45
           0 3.85 3.2 6.85 7.15 6.85
           4.7 0 8.35-3.75 8.35-8.45
           0-5.55-4.55-9.95-10.15-9.95
           -1.35 0-2.65.25-3.85.7"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 4.55c1.05.15 1.95.7 2.55 1.5.25.35-.05.8-.45.7-1-.25-1.85-.85-2.4-1.7-.2-.35.1-.6.3-.5Z"
        fill="currentColor"
      />
      <circle cx="16" cy="14.45" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function BrandLogo({
  className,
  size = "md",
  withWordmark = false,
  showTagline = true,
  tone = "default",
  wordmarkClassName,
  titleClassName,
}: BrandLogoProps) {
  const s = sizeMap[size];

  const boxTone =
    tone === "inverse"
      ? "bg-[hsl(152_50%_32%/0.55)] ring-1 ring-[hsl(152_55%_55%/0.4)] text-[hsl(152_70%_78%)]"
      : tone === "sidebar"
        ? "bg-primary/20 ring-1 ring-primary/30 text-sidebar-brand"
        : "bg-primary/10 ring-1 ring-primary/25 text-primary";

  const wordTone =
    tone === "inverse"
      ? "text-white"
      : tone === "sidebar"
        ? "text-sidebar-foreground"
        : "text-foreground";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className={cn("inline-flex shrink-0 items-center justify-center", s.box, boxTone)}>
        <SpxFarmMark className={s.icon} />
      </span>
      {withWordmark ? (
        <span className={cn("min-w-0", wordmarkClassName)}>
          <span
            className={cn(
              "block font-display font-semibold tracking-tight leading-none",
              size === "xl" ? "text-2xl" : size === "lg" ? "text-xl" : "text-lg",
              wordTone,
              titleClassName,
            )}
          >
            {siteConfig.name}
          </span>
          {showTagline ? (
            <span
              className={cn(
                "mt-0.5 block text-[10px] font-medium uppercase tracking-[0.18em]",
                tone === "inverse"
                  ? "text-white/45"
                  : tone === "sidebar"
                    ? "text-sidebar-foreground/45"
                    : "text-muted-foreground",
              )}
            >
              {siteConfig.tagline}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
