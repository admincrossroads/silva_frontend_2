export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[hsl(155_18%_97%)] text-[hsl(160_28%_14%)]">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 0% 0%, hsl(152 48% 88% / 0.5), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, hsl(152 35% 90% / 0.4), transparent 50%)",
          }}
        />
      </div>
      <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}
