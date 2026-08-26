"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo, SpxFarmMark } from "@/components/brand/spx-farm-logo";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "bot" | "user"; text: string };

const STARTER: ChatMessage = {
  role: "bot",
  text: `Hi — I’m the ${siteConfig.name} assistant. Ask about registration, roles, the plan→settle flow, or how to get access.`,
};

const QUICK_PROMPTS = [
  "How do I register?",
  "What do asset owners see?",
  "What is the work flow?",
  "How do I sign in?",
];

function replyFor(input: string): string {
  const q = input.toLowerCase();

  if (/(register|apply|access|sign.?up)/.test(q)) {
    return "Public applications are paused for now. Use Contact on the home page to reach the platform team, or Sign in if you already have a workspace.";
  }
  if (/(owner|silva|asset|govern)/.test(q)) {
    return "Asset owners approve plans and higher-band spend, and read released reports. They do not see raw field tickets or platform revenue.";
  }
  if (/(vendor|execute|field|crew)/.test(q)) {
    return "Vendors capture field work, submit tickets, and request payment against authorized work orders. Program managers validate before anything reaches the owner.";
  }
  if (/(flow|plan|authorize|settle|afe|afp|ticket)/.test(q)) {
    return "The chain is Plan → Authorize → Assign → Record → Request → Settle. Each step stays in one workspace with role firewalls between desks.";
  }
  if (/(login|sign.?in|password|demo)/.test(q)) {
    return "Go to Sign in from the header. After your workspace is activated, use the email from your application and the password you set on activation.";
  }
  if (/(contact|support|help|email)/.test(q)) {
    return "Scroll to Contact on the landing page and send a message. The platform team will follow up by email.";
  }
  if (/(cookie|privacy)/.test(q)) {
    return "We use essential cookies for sign-in sessions and optional analytics cookies only if you accept them on the cookie banner.";
  }
  if (/(spx|manager|program)/.test(q)) {
    return "Program managers operate the platform: review registrations, issue authorizations, oversee vendors, and release reports to asset owners.";
  }

  return "I can help with registration, roles (owner / manager / vendor), the plan-to-settle flow, sign-in, or contacting the team. Try one of the quick questions below.";
}

export function SiteChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      { role: "bot", text: replyFor(trimmed) },
    ]);
    setDraft("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open ? (
        <div className="flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[hsl(150_14%_82%)] bg-white shadow-[0_20px_50px_-20px_rgba(10,40,30,0.45)]">
          <div className="flex items-center justify-between gap-2 bg-[hsl(165_32%_14%)] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <BrandLogo size="sm" tone="inverse" />
              <div>
                <p className="text-sm font-semibold">{siteConfig.name} Assistant</p>
                <p className="text-[11px] text-white/60">Usually replies instantly</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[hsl(155_18%_97%)] px-3 py-3">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md border border-[hsl(150_14%_88%)] bg-white text-[hsl(160_28%_14%)]",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-[hsl(150_14%_90%)] bg-white px-3 py-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                className="rounded-full border border-[hsl(150_14%_86%)] px-2.5 py-1 text-[11px] text-[hsl(160_14%_36%)] transition hover:border-primary/40 hover:text-primary"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t border-[hsl(150_14%_90%)] bg-white p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question…"
              className="h-10 flex-1 rounded-xl border border-[hsl(150_14%_86%)] bg-[hsl(155_18%_98%)] px-3 text-sm outline-none ring-primary/30 focus:ring-2"
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
      >
        {open ? <X className="h-5 w-5" /> : <SpxFarmMark className="h-6 w-6" />}
      </button>
    </div>
  );
}
