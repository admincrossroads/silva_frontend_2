export const PIPELINE_STEPS = [
  "Request",
  "AFE (bands)",
  "WO",
  "Field",
  "SPX report",
] as const;

export function PipelineStepper({ activeIndex = 0 }: { activeIndex?: number }) {
  return (
    <p className="text-xs text-muted-foreground">
      {PIPELINE_STEPS.map((step, i) => (
        <span key={step}>
          {i > 0 ? <span className="mx-1.5 text-border">→</span> : null}
          <span className={i === activeIndex ? "font-medium text-foreground" : undefined}>{step}</span>
        </span>
      ))}
    </p>
  );
}
