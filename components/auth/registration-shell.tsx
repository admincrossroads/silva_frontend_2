import Link from "next/link";
import { Coffee, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegistrationHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-b border-[hsl(150_14%_86%)] bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
            <Coffee className="h-4 w-4" />
          </span>
          <span className="font-display text-lg tracking-tight">Coffee Field OS</span>
        </Link>
        {right ?? (
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

export type RegistrationStep = {
  label: string;
  description: string;
};

export function RegistrationStepSidebar({
  steps,
  currentStep,
}: {
  steps: RegistrationStep[];
  currentStep: number;
}) {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-[hsl(150_14%_86%)] bg-white/80 p-8 lg:block">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">Application</p>
      <ol className="mt-8 space-y-0">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <li key={step.label} className="relative flex gap-4 pb-10 last:pb-0">
              {i < steps.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-12px)] w-px",
                    done ? "bg-primary" : "bg-[hsl(150_14%_86%)]",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-4 ring-[hsl(155_18%_97%)]",
                  done && "bg-primary text-primary-foreground",
                  active && !done && "bg-primary text-primary-foreground",
                  !done && !active && "border border-[hsl(150_14%_86%)] bg-white text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <div className="pt-0.5">
                <p className={cn("font-medium", active ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export function RegistrationMobileProgress({
  steps,
  currentStep,
}: {
  steps: RegistrationStep[];
  currentStep: number;
}) {
  return (
    <div className="border-b border-[hsl(150_14%_86%)] bg-white/90 px-5 py-4 lg:hidden">
      <p className="text-xs font-medium text-muted-foreground">
        Step {currentStep + 1} of {steps.length} · {steps[currentStep]?.label}
      </p>
      <div className="mt-3 flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= currentStep ? "bg-primary" : "bg-muted")}
          />
        ))}
      </div>
    </div>
  );
}
