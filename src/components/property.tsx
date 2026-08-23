import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, navigate } from "../router";
import * as api from "../lib/api";
import { cx, money, moneyShort, prettyDate, sqft, timeAgo } from "../lib/format";
import { emitFavorites, toast, useFavorites, useSession, useToggleFavorite } from "../lib/store";
import { AMENITIES, PROPERTY_TYPES, type Filters, type Property, type PropertyType, type SortKey, type User } from "../lib/types";
import { SEED_PROPERTIES } from "../lib/data";
import {
  AMENITY_ICONS, IArea, IArrowR, IArrowUR, IBath, IBed, ICalendar, ICamera, ICheck, IChevL, IChevR, IClock, IHeart, IMail, IPin, ISearch, ISliders, IStar, IX,
} from "./icons";
import { Button, Chip, EmptyState, Field, Input, Select, Skeleton, StatusBadge, Stars, Textarea } from "./ui";

export const CITIES = [...new Set(SEED_PROPERTIES.map((p) => p.city))].sort();

const PRICE_RANGES: { label: string; min: number; max: number }[] = [
  { label: "Any price", min: 0, max: 10_000_000 },
  { label: "Under $600K", min: 0, max: 600_000 },
  { label: "$600K – $900K", min: 600_000, max: 900_000 },
  { label: "$900K – $1.2M", min: 900_000, max: 1_200_000 },
  { label: "$1.2M – $1.6M", min: 1_200_000, max: 1_600_000 },
  { label: "$1.6M+", min: 1_600_000, max: 10_000_000 },
];

/* ------------------------------- Property card ------------------------------ */

export function FavoriteButton({ propertyId, className, light = false }: { propertyId: string; className?: string; light?: boolean }) {
  const favorites = useFavorites();
  const toggle = useToggleFavorite();
  const session = useSession();
  const active = favorites.includes(propertyId);
  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await toggle(propertyId);
        toast(
          active ? "Removed from saved homes." : session ? "Saved — find it in your dashboard." : "Saved for this visit. Sign in to keep it.",
          active ? "info" : "success"
        );
      }}
      className={cx(
        "flex h-9 w-9 items-center justify-center rounded-full shadow-soft backdrop-blur transition-all duration-200 hover:scale-110 active:scale-95",
        light ? "bg-pinedeep/60 text-paper hover:text-clay" : "bg-card/90 text-ink/70 hover:text-clay",
        active && "text-clay",
        className
      )}
      aria-label={active ? "Remove from saved homes" : "Save this home"}
      aria-pressed={active}
    >
      <IHeart className="h-4.5 w-4.5" filled={active} />
    </button>
  );
}

export function PropertyCard({ p, view = "grid", onHover }: { p: Property; view?: "grid" | "list"; onHover?: (id: string | null) => void }) {
  const agentName = p.agentId === "u-agent1" ? "Daniel Reyes" : "Priya Nair";
  return (
    <article
      className={cx(
        "group relative overflow-hidden rounded-card border border-mist bg-card transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-lift",
        view === "grid" ? "flex flex-col" : "flex flex-col sm:flex-row"
      )}
      onMouseEnter={() => onHover?.(p.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Link to={`/property/${p.id}`} className={cx("relative block overflow-hidden", view === "grid" ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-auto sm:w-72 sm:shrink-0")}>
        <img
          src={p.images[0]}
          alt={`${p.title} — ${p.district}, ${p.city}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-pinedeep/55 via-transparent to-pinedeep/10 opacity-80 transition-opacity duration-300 group-hover:opacity-95" />
        <span className="absolute bottom-3 left-3 rounded-full bg-pinedeep/80 px-3.5 py-1.5 font-display text-[15px] font-semibold text-paper backdrop-blur-sm">
          {p.status === "sold" ? <span className="line-through opacity-60">{moneyShort(p.price)}</span> : moneyShort(p.price)}
          {p.status === "rented" && <span className="ml-1 text-[11px] font-sans font-bold uppercase tracking-wider text-brasssoft">let</span>}
        </span>
        <span className="absolute left-3 top-3"><StatusBadge status={p.status} /></span>
      </Link>
      <FavoriteButton propertyId={p.id} className={cx("absolute right-3 top-3 z-10", view === "list" && "sm:left-[15rem] sm:right-auto")} light />

      <div className={cx("flex flex-1 flex-col p-5", view === "list" && "sm:p-6")}>
        <div className="flex items-start justify-between gap-3">
          <Link to={`/property/${p.id}`} className="font-display text-[19px] font-semibold leading-snug text-ink transition-colors group-hover:text-moss">
            {p.title}
          </Link>
          <IArrowUR className="mt-1 h-4.5 w-4.5 shrink-0 text-brass opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-ink/55">
          <IPin className="h-3.5 w-3.5 text-brass" />
          {p.district} · {p.city}, {p.state}
        </p>
        {view === "list" && <p className="mt-3 hidden text-[13.5px] leading-relaxed text-ink/60 sm:line-clamp-2">{p.description}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-mistsoft pt-4 text-[12.5px] font-semibold text-ink/70">
          <span className="flex items-center gap-1.5"><IBed className="h-4 w-4 text-moss" />{p.beds} bd</span>
          <span className="flex items-center gap-1.5"><IBath className="h-4 w-4 text-moss" />{p.baths} ba</span>
          <span className="flex items-center gap-1.5"><IArea className="h-4 w-4 text-moss" />{p.area.toLocaleString()} sqft</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px] font-medium text-ink/45">
          <span>Listed by {agentName}</span>
          <span className="flex items-center gap-1"><IClock className="h-3.5 w-3.5" />{timeAgo(p.listedOn)}</span>
        </div>
      </div>
    </article>
  );
}

export function PropertyCardSkeleton({ view = "grid" }: { view?: "grid" | "list" }) {
  return (
    <div className={cx("overflow-hidden rounded-card border border-mist bg-card", view === "list" && "flex flex-col sm:flex-row")}>
      <Skeleton className={view === "grid" ? "aspect-[4/3] w-full rounded-none" : "aspect-[4/3] w-full rounded-none sm:aspect-auto sm:h-auto sm:w-72 sm:shrink-0"} />
      <div className={cx("flex-1 space-y-3 p-5", view === "list" && "sm:p-6")}>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3.5 w-2/3" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-3.5 w-12" /><Skeleton className="h-3.5 w-12" /><Skeleton className="h-3.5 w-16" />
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Search bar ------------------------------- */

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const [city, setCity] = useState("any");
  const [type, setType] = useState("any");
  const [price, setPrice] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = PRICE_RANGES[price];
    const params = new URLSearchParams();
    if (city !== "any") params.set("city", city);
    if (type !== "any") params.set("type", type);
    if (r.min > 0) params.set("min", String(r.min));
    if (r.max < 10_000_000) params.set("max", String(r.max));
    navigate(`/listings${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <form onSubmit={submit} className={cx("w-full rounded-2xl border border-mist bg-card p-3 shadow-lift", compact && "rounded-xl")} aria-label="Search homes">
      <div className={cx("grid gap-2.5", compact ? "grid-cols-2 md:grid-cols-[1.2fr_1fr_1.2fr_auto]" : "grid-cols-1 sm:grid-cols-[1.2fr_1fr_1.2fr_auto]")}>
        <div className="flex items-center gap-2.5 rounded-xl bg-mistsoft/70 px-3.5 transition-colors focus-within:bg-mistsoft">
          <IPin className="h-4.5 w-4.5 shrink-0 text-brass" />
          <select value={city} onChange={(e) => setCity(e.target.value)} className="h-11 w-full cursor-pointer bg-transparent text-[14px] font-medium text-ink focus:outline-none" aria-label="Location">
            <option value="any">Anywhere</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-mistsoft/70 px-3.5 transition-colors focus-within:bg-mistsoft">
          <IArea className="h-4.5 w-4.5 shrink-0 text-brass" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-11 w-full cursor-pointer bg-transparent text-[14px] font-medium text-ink focus:outline-none" aria-label="Property type">
            <option value="any">Any type</option>
            {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-mistsoft/70 px-3.5 transition-colors focus-within:bg-mistsoft">
          <ISliders className="h-4.5 w-4.5 shrink-0 text-brass" />
          <select value={price} onChange={(e) => setPrice(Number(e.target.value))} className="h-11 w-full cursor-pointer bg-transparent text-[14px] font-medium text-ink focus:outline-none" aria-label="Price range">
            {PRICE_RANGES.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
          </select>
        </div>
        <button type="submit" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-[14px] font-bold text-paper transition-all duration-200 hover:bg-pine active:scale-[0.98]">
          <ISearch className="h-4.5 w-4.5 text-brasssoft" /> Search
        </button>
      </div>
    </form>
  );
}

/* -------------------------------- Filter panel ------------------------------ */

export interface FiltersState extends Omit<Filters, "sort"> {
  sort: SortKey;
}

export function FiltersPanel({ filters, onChange }: { filters: FiltersState; onChange: (f: FiltersState) => void }) {
  const set = (patch: Partial<FiltersState>) => onChange({ ...filters, ...patch });
  const isDirty = filters.city !== "any" || filters.type !== "any" || filters.min > 0 || filters.max < 10_000_000 || filters.beds > 0 || filters.baths > 0 || filters.status !== "any" || filters.q !== "";

  const chip = (active: boolean) =>
    cx(
      "rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-all duration-200",
      active ? "border-pine bg-pine text-paper shadow-soft" : "border-ink/15 bg-card text-ink/65 hover:border-ink/40 hover:text-ink"
    );

  return (
    <div className="space-y-7 rounded-card border border-mist bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink"><ISliders className="h-4.5 w-4.5 text-brass" /> Refine</h2>
        {isDirty && (
          <button
            onClick={() => onChange({ q: "", city: "any", type: "any", min: 0, max: 10_000_000, beds: 0, baths: 0, status: "any", sort: filters.sort })}
            className="text-[12px] font-bold text-clay underline decoration-clay/40 underline-offset-4 transition-colors hover:decoration-clay"
          >
            Clear all
          </button>
        )}
      </div>

      <Field label="Keyword">
        <div className="relative">
          <ISearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <Input value={filters.q} onChange={(e) => set({ q: e.target.value })} placeholder="Courtyard, loft, Zilker…" className="pl-10" />
        </div>
      </Field>

      <Field label="Location">
        <Select value={filters.city} onChange={(e) => set({ city: e.target.value })}>
          <option value="any">All locations</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </Field>

      <div>
        <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-ink/60">Type</p>
        <div className="flex flex-wrap gap-2">
          <button className={chip(filters.type === "any")} onClick={() => set({ type: "any" })}>All</button>
          {PROPERTY_TYPES.map((t) => (
            <button key={t.value} className={chip(filters.type === t.value)} onClick={() => set({ type: t.value })}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Min price">
          <Select value={filters.min} onChange={(e) => set({ min: Number(e.target.value) })}>
            {[0, 500_000, 700_000, 900_000, 1_200_000, 1_500_000].map((v) => <option key={v} value={v}>{v === 0 ? "No min" : moneyShort(v)}</option>)}
          </Select>
        </Field>
        <Field label="Max price">
          <Select value={filters.max} onChange={(e) => set({ max: Number(e.target.value) })}>
            {[600_000, 900_000, 1_200_000, 1_600_000, 2_000_000, 10_000_000].map((v) => <option key={v} value={v}>{v === 10_000_000 ? "No max" : moneyShort(v)}</option>)}
          </Select>
        </Field>
      </div>

      <div>
        <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-ink/60">Bedrooms</p>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((n) => (
            <button key={n} className={chip(filters.beds === n)} onClick={() => set({ beds: n })}>{n === 0 ? "Any" : `${n}+`}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-ink/60">Bathrooms</p>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((n) => (
            <button key={n} className={chip(filters.baths === n)} onClick={() => set({ baths: n })}>{n === 0 ? "Any" : `${n}+`}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-ink/60">Listing status</p>
        <div className="flex flex-wrap gap-2">
          {([["any", "All"], ["available", "For sale"], ["rented", "Rentals"], ["sold", "Sold"]] as const).map(([v, l]) => (
            <button key={v} className={chip(filters.status === v)} onClick={() => set({ status: v })}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- Map ------------------------------------ */

const DISTRICTS = [
  { label: "Old Quarter", x: 66, y: 74 },
  { label: "Riverside", x: 46, y: 52 },
  { label: "Hillcrest", x: 22, y: 30 },
  { label: "Warehouse District", x: 74, y: 30 },
  { label: "Lakefront", x: 12, y: 56 },
  { label: "Midtown", x: 44, y: 14 },
];

export function MapView({ items, activeId, onHover, className }: { items: Property[]; activeId: string | null; onHover: (id: string | null) => void; className?: string }) {
  return (
    <div className={cx("relative overflow-hidden rounded-card border border-mist bg-[#e9e6da] shadow-soft", className)}>
      <svg viewBox="0 0 800 520" className="h-full w-full" role="img" aria-label="Stylized city map with listing pins">
        <rect width="800" height="520" fill="#eae7db" />
        {/* street grid */}
        {[80, 160, 240, 320, 400, 480, 560, 640, 720].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="520" stroke="#ddd9c9" strokeWidth={x % 240 === 80 ? 5 : 2} />
        ))}
        {[65, 130, 195, 260, 325, 390, 455].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="800" y2={y} stroke="#ddd9c9" strokeWidth={y === 260 ? 5 : 2} />
        ))}
        {/* diagonal boulevard */}
        <line x1="0" y1="470" x2="800" y2="120" stroke="#d6d2c0" strokeWidth="7" />
        {/* river */}
        <path d="M -10 380 C 140 350, 240 420, 380 390 S 640 330, 810 360 L 810 430 C 640 400, 520 460, 380 450 S 140 420, -10 450 Z" fill="#b7c9bd" opacity="0.75" />
        {/* parks */}
        <rect x="130" y="180" width="90" height="60" rx="14" fill="#c3d2c0" />
        <rect x="540" y="90" width="70" height="50" rx="12" fill="#c3d2c0" />
        <circle cx="660" cy="440" r="34" fill="#c3d2c0" />
        {DISTRICTS.map((d) => (
          <text key={d.label} x={d.x * 8} y={d.y * 5.2} fontSize="11" fontWeight="700" letterSpacing="2.5" fill="#a8a390" style={{ textTransform: "uppercase" }}>
            {d.label.toUpperCase()}
          </text>
        ))}

        {items.map((p) => {
          const x = p.mapX * 8;
          const y = p.mapY * 5.2;
          const active = activeId === p.id;
          return (
            <g
              key={p.id}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer transition-transform duration-200"
              onMouseEnter={() => onHover(p.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => navigate(`/property/${p.id}`)}
            >
              {active && <circle r="17" fill="none" stroke="var(--color-brass)" strokeWidth="2" opacity="0.45" strokeDasharray="3 5" />}
              <circle r={active ? 11 : 8.5} fill={active ? "var(--color-brass)" : "var(--color-pine)"} stroke="#f4f2ec" strokeWidth="2.5" style={{ transition: "all .2s" }} />
              <g style={{ transition: "all .2s", opacity: active ? 1 : 0.92 }}>
                <rect x="-33" y="-40" width="66" height="21" rx="10.5" fill={active ? "var(--color-brass)" : "var(--color-ink)"} />
                <text y="-26" textAnchor="middle" fontSize="11" fontWeight="700" fill={active ? "#211a08" : "#f4f2ec"}>
                  {moneyShort(p.price)}
                </text>
                <path d={`M -5 -19 L 0 -13 L 5 -19 Z`} fill={active ? "var(--color-brass)" : "var(--color-ink)"} />
              </g>
            </g>
          );
        })}
      </svg>
      <span className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-pinedeep/85 px-3.5 py-1.5 text-[11px] font-semibold text-paper backdrop-blur">
        <span className="inline-block h-2 w-2 rounded-full bg-brass" /> {items.length} home{items.length === 1 ? "" : "s"} on map — click a pin
      </span>
    </div>
  );
}

export function MiniMap({ p }: { p: Property }) {
  return (
    <div className="relative overflow-hidden rounded-card border border-mist bg-[#e9e6da]">
      <svg viewBox="0 0 640 300" className="h-full w-full" role="img" aria-label={`Map showing ${p.title} at ${p.address}`}>
        <rect width="640" height="300" fill="#eae7db" />
        {[80, 160, 240, 320, 400, 480, 560].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="300" stroke="#ddd9c9" strokeWidth={x === 320 ? 4 : 2} />)}
        {[75, 150, 225].map((y) => <line key={y} x1="0" y1={y} x2="640" y2={y} stroke="#ddd9c9" strokeWidth={y === 150 ? 4 : 2} />)}
        <line x1="0" y1="270" x2="640" y2="40" stroke="#d6d2c0" strokeWidth="6" />
        <rect x="430" y="170" width="90" height="60" rx="14" fill="#c3d2c0" />
        <g transform="translate(320, 150)">
          <circle r="30" fill="none" stroke="var(--color-brass)" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.7" />
          <circle r="11" fill="var(--color-brass)" stroke="#f4f2ec" strokeWidth="3" />
          <circle r="3.5" fill="#f4f2ec" />
        </g>
      </svg>
      <div className="absolute left-4 top-4 max-w-[65%] rounded-xl bg-pinedeep/90 px-4 py-3 text-paper shadow-lift backdrop-blur">
        <p className="font-display text-[15px] font-semibold leading-tight">{p.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-sagelight"><IPin className="h-3.5 w-3.5 text-brass" /> {p.address}, {p.city}</p>
      </div>
    </div>
  );
}

/* ---------------------------------- Gallery --------------------------------- */

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const move = useCallback(
    (dir: 1 | -1) => {
      setLightbox((cur) => (cur === null ? cur : (cur + dir + images.length) % images.length));
    },
    [images.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, move]);

  const thumbs = images.slice(1, 3);

  return (
    <>
      <div className="grid gap-2.5 sm:grid-cols-[1.7fr_1fr]">
        <button className="group relative block aspect-[16/11] overflow-hidden rounded-card sm:row-span-2" onClick={() => setLightbox(0)} aria-label="Open photo gallery">
          <img src={images[0]} alt={`${title} — main photo`} className="kb-img h-full w-full object-cover" />
          <span className="absolute inset-0 bg-pinedeep/0 transition-colors duration-300 group-hover:bg-pinedeep/15" />
          <span className="absolute bottom-3.5 right-3.5 flex items-center gap-2 rounded-full bg-pinedeep/85 px-3.5 py-2 text-[12px] font-bold text-paper backdrop-blur transition-transform duration-300 group-hover:scale-105">
            <ICamera className="h-4 w-4 text-brasssoft" /> View all {images.length} photos
          </span>
        </button>
        {thumbs.map((src, i) => (
          <button key={src + i} className="group relative hidden aspect-[16/10.4] overflow-hidden rounded-card sm:block" onClick={() => setLightbox(i + 1)} aria-label={`Open photo ${i + 2}`}>
            <img src={src} alt={`${title} — photo ${i + 2}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
            <span className="absolute inset-0 bg-pinedeep/0 transition-colors duration-300 group-hover:bg-pinedeep/15" />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[95] flex flex-col bg-pinedeep/97" role="dialog" aria-modal="true" aria-label={`${title} photo gallery`}>
          <div className="flex items-center justify-between px-5 py-4 text-paper">
            <p className="text-[13px] font-bold tracking-wide">{title}</p>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-paper/10 px-3 py-1 text-[12px] font-bold text-sagelight">{lightbox + 1} / {images.length}</span>
              <button onClick={() => setLightbox(null)} className="rounded-full bg-paper/10 p-2.5 transition-colors hover:bg-paper/20" aria-label="Close gallery">
                <IX className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-14 pb-6">
            <img src={images[lightbox]} alt={`${title} — photo ${lightbox + 1}`} className="anim-fade max-h-full max-w-full rounded-lg object-contain shadow-lift" />
            <button onClick={() => move(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-paper/10 p-3 text-paper transition-all hover:bg-brass hover:text-pinedeep" aria-label="Previous photo">
              <IChevL className="h-5 w-5" />
            </button>
            <button onClick={() => move(1)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-paper/10 p-3 text-paper transition-all hover:bg-brass hover:text-pinedeep" aria-label="Next photo">
              <IChevR className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------------------- Agent card -------------------------------- */

export function AgentCard({ agent }: { agent: User | null }) {
  if (!agent) return null;
  return (
    <div className="overflow-hidden rounded-card border border-mist bg-card">
      <div className="flex items-center gap-4 border-b border-mist bg-pine px-5 py-5 text-paper">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brass font-display text-lg font-semibold text-pinedeep">
          {agent.name.split(" ").map((n) => n[0]).join("")}
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-tight">{agent.name}</p>
          <p className="text-[12.5px] text-sagelight">{agent.title}</p>
          <span className="mt-1 flex items-center gap-2 text-[12px] text-brasssoft">
            <Stars rating={agent.rating ?? 4.8} className="h-3.5 w-3.5" />
            {agent.rating?.toFixed(1)} · {agent.deals} closings
          </span>
        </div>
      </div>
      <div className="space-y-2.5 p-5">
        {agent.bio && <p className="text-[13.5px] leading-relaxed text-ink/65">{agent.bio}</p>}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <a href={`tel:${agent.phone.replace(/[^0-9]/g, "")}`} className="flex h-11 items-center justify-center gap-2 rounded-full border border-ink/15 text-[13px] font-bold text-ink transition-all hover:border-ink hover:bg-ink hover:text-paper">
            <IPin className="hidden" /><PhoneGlyph /> Call
          </a>
          <a href={`mailto:${agent.email}`} className="flex h-11 items-center justify-center gap-2 rounded-full bg-brass text-[13px] font-bold text-[#211a08] transition-colors hover:bg-brassdeep hover:text-paper">
            <IMail className="h-4 w-4" /> Email
          </a>
        </div>
        <p className="flex items-center justify-center gap-1.5 pt-1 text-[12px] font-semibold text-moss">
          <ICheck className="h-3.5 w-3.5" /> Typically replies within 2 hours
        </p>
      </div>
    </div>
  );
}

function PhoneGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M5.5 4h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L16 14l4 1.5v3A1.5 1.5 0 0 1 18.5 20 15.5 15.5 0 0 1 4 5.5 1.5 1.5 0 0 1 5.5 4Z" />
    </svg>
  );
}

/* ----------------------------- Schedule visit form -------------------------- */

const VISIT_TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:30", "18:00"];

export function ScheduleVisitForm({ property, agent }: { property: Property; agent: User | null }) {
  const session = useSession();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("11:00");
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!date) errs.date = "Pick a date";
    else if (date < today) errs.date = "Choose a future date";
    if (!session && name.trim().length < 2) errs.name = "Your name, please";
    if (!session && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Valid email required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await api.addBooking({ propertyId: property.id, name, email, date, time });
      setDone(true);
      toast("Tour requested — the agent will confirm shortly.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="anim-pop rounded-card border border-moss/30 bg-moss/8 p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss text-paper"><ICheck className="h-6 w-6" /></span>
        <h3 className="mt-3 font-display text-xl font-semibold text-ink">Visit requested</h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink/60">
          {prettyDate(date)} at {time}. {agent ? agent.name.split(" ")[0] : "The agent"} will confirm by email — usually within a few hours.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => { setDone(false); setDate(""); }}>Request another time</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-mist bg-card p-5" noValidate>
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
        <ICalendar className="h-4.5 w-4.5 text-brass" /> Schedule a visit
      </h3>
      <p className="mt-1 text-[12.5px] text-ink/50">Free · no obligation · {agent ? `with ${agent.name}` : "with the listing agent"}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field label="Date" error={errors.date}>
          <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Time">
          <Select value={time} onChange={(e) => setTime(e.target.value)}>
            {VISIT_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        {!session && (
          <>
            <Field label="Name" error={errors.name}>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </Field>
          </>
        )}
      </div>
      <Button type="submit" variant="brass" className="mt-4 w-full" disabled={busy}>
        {busy ? "Requesting…" : "Request this time"}
      </Button>
    </form>
  );
}

/* -------------------------------- Inquiry form ------------------------------ */

export function InquiryForm({ property }: { property: Property }) {
  const session = useSession();
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [message, setMessage] = useState(`Hi — I'd love to know more about ${property.title}. Is it still available for a tour?`);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!session && name.trim().length < 2) errs.name = "Your name, please";
    if (!session && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Valid email required";
    if (message.trim().length < 10) errs.message = "A little more detail helps";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await api.addInquiry({ propertyId: property.id, name, email, message });
      setSent(true);
      toast("Inquiry sent to the listing agent.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-card border border-mist bg-card p-6" noValidate>
      <h3 className="font-display text-xl font-semibold text-ink">Ask about this home</h3>
      <p className="mt-1 text-[13px] text-ink/50">Goes straight to the listing agent's lead inbox.</p>
      {sent ? (
        <div className="anim-pop mt-4 flex items-center gap-3 rounded-xl bg-moss/10 px-4 py-3.5 text-[13.5px] font-semibold text-moss">
          <ICheck className="h-5 w-5" /> Sent — watch your inbox for a reply.
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Name" error={errors.name}>
              <Input value={session?.name ?? name} disabled={!!session} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input type="email" value={session?.email ?? email} disabled={!!session} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Message" error={errors.message}>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
            </Field>
          </div>
          <Button type="submit" variant="primary" className="mt-4" disabled={busy}>
            {busy ? "Sending…" : <>Send inquiry <IArrowR className="h-4 w-4" /></>}
          </Button>
        </>
      )}
    </form>
  );
}

/* ------------------------------- Amenity + facts ---------------------------- */

export function AmenityGrid({ amenities }: { amenities: string[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {amenities.map((a) => {
        const Icon = AMENITY_ICONS[a] ?? ICheck;
        return (
          <li key={a} className="flex items-center gap-3 rounded-xl border border-mist bg-card px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-brass/50 hover:shadow-soft">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-moss/10 text-moss"><Icon className="h-4 w-4" /></span>
            <span className="text-[13px] font-semibold text-ink/80">{a}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function FactsRow({ p }: { p: Property }) {
  const facts = [
    { icon: <IBed className="h-5 w-5" />, label: "Bedrooms", value: String(p.beds) },
    { icon: <IBath className="h-5 w-5" />, label: "Bathrooms", value: String(p.baths) },
    { icon: <IArea className="h-5 w-5" />, label: "Interior", value: sqft(p.area) },
    { icon: <IHomeGlyph />, label: "Type", value: p.type.charAt(0).toUpperCase() + p.type.slice(1) },
    { icon: <ICalendar className="h-5 w-5" />, label: "Built", value: String(p.yearBuilt) },
    { icon: <IClock className="h-5 w-5" />, label: "Listed", value: timeAgo(p.listedOn) },
  ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-mist bg-mist sm:grid-cols-3 lg:grid-cols-6">
      {facts.map((f) => (
        <div key={f.label} className="bg-card px-4 py-4 text-center transition-colors hover:bg-mistsoft/60">
          <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-pine/8 text-moss">{f.icon}</span>
          <p className="mt-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink/45">{f.label}</p>
          <p className="mt-0.5 font-display text-[15px] font-semibold text-ink">{f.value}</p>
        </div>
      ))}
    </div>
  );
}

function IHomeGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="m4 11 8-7 8 7" /><path d="M6 9.5V20h12V9.5" /><path d="M10 20v-5h4v5" />
    </svg>
  );
}

/* ------------------------------ Similar section ----------------------------- */

export function SimilarSection({ propertyId }: { propertyId: string }) {
  const [items, setItems] = useState<Property[] | null>(null);
  useEffect(() => {
    let on = true;
    api.getSimilar(propertyId, 3).then((r) => on && setItems(r));
    return () => { on = false; };
  }, [propertyId]);

  return (
    <section className="mt-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brass">
            <span className="h-px w-8 bg-brass/70" /> Keep looking
          </p>
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Homes with a similar spirit</h2>
        </div>
        <Link to="/listings" className="hidden items-center gap-2 text-[13.5px] font-bold text-moss transition-colors hover:text-ink sm:flex">
          Browse all listings <IArrowR className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items === null
          ? [1, 2, 3].map((i) => <PropertyCardSkeleton key={i} />)
          : items.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}

/* --------------------------------- Reviews ---------------------------------- */

export function ReviewsBlock({ propertyId }: { propertyId: string }) {
  const [data, setData] = useState<{ reviews: { id: string; name: string; rating: number; comment: string; date: string }[]; average: number } | null>(null);
  useEffect(() => {
    let on = true;
    api.listReviews(propertyId).then((r) => on && setData(r));
    return () => { on = false; };
  }, [propertyId]);

  if (!data) return <Skeleton className="h-40 w-full rounded-card" />;
  if (data.reviews.length === 0) {
    return <p className="rounded-card border border-dashed border-ink/20 bg-card/60 px-5 py-8 text-center text-sm text-ink/50">No visits reviewed yet — be the first after your tour.</p>;
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="font-display text-4xl font-semibold text-ink">{data.average.toFixed(1)}</span>
        <div>
          <Stars rating={data.average} />
          <p className="mt-0.5 text-[12px] font-semibold text-ink/50">{data.reviews.length} visit review{data.reviews.length === 1 ? "" : "s"}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {data.reviews.map((r) => (
          <figure key={r.id} className="rounded-card border border-mist bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft">
            <div className="flex items-center justify-between">
              <Stars rating={r.rating} className="h-3.5 w-3.5" />
              <time className="text-[11.5px] font-semibold text-ink/40">{prettyDate(r.date)}</time>
            </div>
            <blockquote className="mt-3 text-[13.5px] leading-relaxed text-ink/75">“{r.comment}”</blockquote>
            <figcaption className="mt-3 flex items-center gap-2 text-[12.5px] font-bold text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-brass" /> {r.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
