import React, { useEffect, useRef, useState } from "react";
import { Link } from "../router";
import { cx, initials } from "../lib/format";
import type { ListingStatus } from "../lib/types";
import { ICheck, IChevD, IInfo, IWarn, IX } from "./icons";
import { dismissToast, useToasts } from "../lib/store";

/* --------------------------------- Button --------------------------------- */

type BtnVariant = "primary" | "brass" | "outline" | "ghost" | "paper";
type BtnSize = "sm" | "md" | "lg";

const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-ink text-paper hover:bg-pine active:translate-y-px",
  brass: "bg-brass text-[#211a08] hover:bg-brassdeep hover:text-paper active:translate-y-px",
  outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink hover:bg-ink/5",
  paper: "bg-card text-ink hover:bg-mistsoft border border-mist",
};

const btnSizes: Record<BtnSize, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-[15px] gap-2.5",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  to?: string;
}

export function Button({ variant = "primary", size = "md", to, className, children, ...rest }: ButtonProps) {
  const cls = cx(
    "inline-flex items-center justify-center font-semibold tracking-wide rounded-full transition-all duration-200 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
    "disabled:opacity-50 disabled:pointer-events-none",
    btnVariants[variant],
    btnSizes[size],
    className
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* --------------------------------- Badges --------------------------------- */

const statusStyles: Record<ListingStatus, string> = {
  available: "bg-moss/12 text-moss",
  sold: "bg-clay/12 text-clay",
  rented: "bg-brass/15 text-brassdeep",
  pending: "bg-ink/8 text-ink/60",
  rejected: "bg-clay/10 text-clay border border-clay/30",
};

const statusLabels: Record<ListingStatus, string> = {
  available: "For Sale",
  sold: "Sold",
  rented: "Rented",
  pending: "Pending Review",
  rejected: "Rejected",
};

export function StatusBadge({ status, className }: { status: ListingStatus; className?: string }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]", statusStyles[status], className)}>
      {statusLabels[status]}
    </span>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full bg-mistsoft px-3 py-1.5 text-[12px] font-semibold text-ink/75", className)}>
      {children}
    </span>
  );
}

export function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={cx("mb-3 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em]", light ? "text-brasssoft" : "text-brass")}>
      <span className={cx("h-px w-8", light ? "bg-brasssoft/70" : "bg-brass/70")} />
      {children}
    </p>
  );
}

/* ---------------------------------- Forms ---------------------------------- */

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 flex items-baseline justify-between text-[12px] font-bold uppercase tracking-[0.1em] text-ink/60">
        {label}
        {hint && <span className="font-medium normal-case tracking-normal text-ink/40">{hint}</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-clay">
          <IWarn className="h-3.5 w-3.5" /> {error}
        </span>
      )}
    </label>
  );
}

const inputCls =
  "w-full rounded-[10px] border border-ink/15 bg-card px-3.5 h-11 text-[14px] text-ink placeholder:text-ink/35 transition-all duration-200 focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/25 hover:border-ink/30";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputCls, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(inputCls, "h-auto min-h-28 py-2.5 leading-relaxed", props.className)} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cx("relative", className)}>
      <select {...rest} className={cx(inputCls, "appearance-none pr-9 cursor-pointer")}>
        {children}
      </select>
      <IChevD className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
    </div>
  );
}

/* ---------------------------------- Modal ---------------------------------- */

export function Modal({
  title, subtitle, onClose, children, wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button className="anim-fade absolute inset-0 bg-pinedeep/70 backdrop-blur-[3px]" onClick={onClose} aria-label="Close dialog" />
      <div className={cx("anim-pop relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-paper shadow-lift sm:rounded-2xl", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-mist bg-paper/95 px-6 py-4 backdrop-blur">
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[13px] text-ink/55">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-ink/50 transition-colors hover:bg-mistsoft hover:text-ink" aria-label="Close">
            <IX className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* --------------------------------- Skeleton -------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} aria-hidden="true" />;
}

/* ---------------------------------- Reveal --------------------------------- */

export function Reveal({
  children, className, delay = 0, as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li" | "figure";
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={cx("reveal", inView && "is-in", className)} style={{ ["--d" as string]: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/* --------------------------------- CountUp --------------------------------- */

export function CountUp({ to, prefix = "", suffix = "", decimals = 0, duration = 1500 }: { to: number; prefix?: string; suffix?: string; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        if (reduced) {
          setVal(to);
          return;
        }
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(to * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/* ------------------------------- Section head ------------------------------ */

export function SectionHead({ kicker, title, right, light = false }: { kicker: string; title: React.ReactNode; right?: React.ReactNode; light?: boolean }) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div>
        <Kicker light={light}>{kicker}</Kicker>
        <h2 className={cx("font-display text-3xl font-semibold leading-[1.08] sm:text-[2.6rem]", light ? "text-paper" : "text-ink")}>{title}</h2>
      </div>
      {right}
    </Reveal>
  );
}

/* --------------------------------- Monogram -------------------------------- */

const monogramTones = ["bg-pine text-brasssoft", "bg-brass text-pinedeep", "bg-moss text-paper", "bg-ink text-brasssoft", "bg-clay text-paper"];

export function Monogram({ name, size = "md", tone }: { name: string; size?: "sm" | "md" | "lg"; tone?: number }) {
  const sizes = { sm: "h-8 w-8 text-[11px]", md: "h-11 w-11 text-[13px]", lg: "h-14 w-14 text-lg" };
  const idx = tone ?? (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % monogramTones.length;
  return (
    <span className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold", sizes[size], monogramTones[idx])}>
      {initials(name)}
    </span>
  );
}

/* ---------------------------------- Stars ---------------------------------- */

export function Stars({ rating, className = "h-4 w-4" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-brass" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={cx(className, i <= Math.round(rating) ? "fill-brass" : "fill-ink/15")} aria-hidden="true">
          <path d="m12 3.6 2.5 5.2 5.7.7-4.2 4 1.1 5.7L12 16.4l-5.1 2.8 1.1-5.7-4.2-4 5.7-.7L12 3.6Z" />
        </svg>
      ))}
    </span>
  );
}

/* -------------------------------- Empty state ------------------------------ */

export function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="anim-fade flex flex-col items-center rounded-card border border-dashed border-ink/20 bg-card/60 px-6 py-16 text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-mistsoft text-ink/50">{icon}</span>
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/55">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------------------------------- Toasts --------------------------------- */

export function ToastHost() {
  const toasts = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[110] flex w-[min(92vw,380px)] flex-col gap-2.5" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            "anim-toast pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-lift backdrop-blur",
            t.kind === "success" && "border-moss/30 bg-pine text-paper",
            t.kind === "error" && "border-clay/40 bg-[#2a140c] text-[#f6e3da]",
            t.kind === "info" && "border-ink/20 bg-ink text-paper"
          )}
        >
          <span className={cx("mt-0.5", t.kind === "success" ? "text-brasssoft" : t.kind === "error" ? "text-[#e8a084]" : "text-brasssoft")}>
            {t.kind === "success" ? <ICheck className="h-4.5 w-4.5" /> : t.kind === "error" ? <IWarn className="h-4.5 w-4.5" /> : <IInfo className="h-4.5 w-4.5" />}
          </span>
          <p className="flex-1 text-[13.5px] font-medium leading-snug">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} className="rounded p-0.5 opacity-60 transition-opacity hover:opacity-100" aria-label="Dismiss notification">
            <IX className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- Confirm -------------------------------- */

export function ConfirmDialog({ title, body, confirmLabel = "Delete", onConfirm, onCancel }: { title: string; body: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm leading-relaxed text-ink/65">{body}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="paper" onClick={onCancel}>Cancel</Button>
        <Button className="bg-clay hover:bg-[#8a3f22] hover:text-paper" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
