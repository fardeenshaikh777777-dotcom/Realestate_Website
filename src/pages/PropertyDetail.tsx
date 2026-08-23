import React, { useEffect, useState } from "react";
import { Link, useRoute } from "../router";
import * as api from "../lib/api";
import { money, prettyDate, sqft } from "../lib/format";
import type { Property, User } from "../lib/types";
import {
  AgentCard, AmenityGrid, FactsRow, FavoriteButton, Gallery, InquiryForm, MiniMap, ReviewsBlock, ScheduleVisitForm, SimilarSection,
} from "../components/property";
import { toast } from "../lib/store";
import { Button, Chip, Kicker, Skeleton, StatusBadge } from "../components/ui";
import { IChevL, IEye, IPin, IShare } from "../components/icons";

export function PropertyDetailPage() {
  const route = useRoute();
  const id = route.parts[1] ?? "";
  const [data, setData] = useState<{ property: Property; agent: User | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    setData(null);
    setError(null);
    api
      .getProperty(id)
      .then((r) => on && setData(r))
      .catch((e) => on && setError(e instanceof Error ? e.message : "Listing unavailable."));
    return () => { on = false; };
  }, [id]);

  if (error) {
    return (
      <main className="mx-auto max-w-xl px-5 pb-24 pt-44 text-center">
        <p className="font-display text-6xl font-semibold text-brass/60">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink">This address isn't on our map</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink/55">{error}</p>
        <Button to="/listings" variant="primary" className="mt-8"><IChevL className="h-4 w-4" /> Back to listings</Button>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
        <Skeleton className="h-4 w-64" />
        <div className="mt-6 grid gap-3 sm:grid-cols-[1.7fr_1fr]">
          <Skeleton className="aspect-[16/11] rounded-card sm:row-span-2" />
          <Skeleton className="aspect-[16/10] rounded-card" />
          <Skeleton className="aspect-[16/10] rounded-card" />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-40 w-full rounded-card" />
          </div>
          <div className="space-y-5">
            <Skeleton className="h-52 w-full rounded-card" />
            <Skeleton className="h-72 w-full rounded-card" />
          </div>
        </div>
      </main>
    );
  }

  const { property: p, agent } = data;

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      {/* breadcrumb + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-[13px] font-semibold text-ink/50" aria-label="Breadcrumb">
          <Link to="/" className="transition-colors hover:text-ink">Home</Link>
          <span className="text-ink/30">/</span>
          <Link to="/listings" className="transition-colors hover:text-ink">Listings</Link>
          <span className="text-ink/30">/</span>
          <span className="text-ink">{p.title}</span>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              try {
                navigator.clipboard?.writeText(window.location.href);
              } catch { /* noop */ }
              toast("Link copied to clipboard.");
            }}
            className="flex h-10 items-center gap-2 rounded-full border border-ink/15 bg-card px-4 text-[13px] font-bold text-ink transition-all hover:border-ink hover:bg-ink hover:text-paper"
          >
            <IShare className="h-4 w-4" /> Share
          </button>
          <FavoriteButton propertyId={p.id} className="h-10 w-10 border border-ink/15 bg-card shadow-none" />
        </div>
      </div>

      {/* title row */}
      <div className="anim-pop mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={p.status} />
            <Chip>{p.type}</Chip>
            <Chip><IEye className="h-3.5 w-3.5" /> {p.views.toLocaleString()} views</Chip>
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-[2.7rem]">{p.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-[14.5px] font-medium text-ink/60">
            <IPin className="h-4.5 w-4.5 text-brass" /> {p.address} · {p.district}, {p.city}, {p.state}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl font-semibold text-ink">{money(p.price)}</p>
          <p className="mt-1 text-[12.5px] font-semibold text-ink/50">
            ${Math.round(p.price / p.area).toLocaleString()} / sq ft · listed {prettyDate(p.listedOn)}
          </p>
        </div>
      </div>

      {/* gallery */}
      <div className="mt-8">
        <Gallery images={p.images} title={p.title} />
      </div>

      {/* body */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-14">
          <section>
            <FactsRow p={p} />
          </section>

          <RevealSection title="About this home">
            <p className="max-w-2xl text-[15px] leading-[1.85] text-ink/75">{p.description}</p>
          </RevealSection>

          <RevealSection title="Amenities & features">
            <AmenityGrid amenities={p.amenities} />
          </RevealSection>

          <RevealSection title="Location">
            <MiniMap p={p} />
            <div className="mt-4 flex flex-wrap gap-2.5">
              {["Walkable district core", "Top-rated schools nearby", `${p.district} community`].map((t) => <Chip key={t}>{t}</Chip>)}
            </div>
          </RevealSection>

          <RevealSection title="Visit reviews">
            <ReviewsBlock propertyId={p.id} />
          </RevealSection>

          <RevealSection title="Questions? Ask the agent">
            <InquiryForm property={p} />
          </RevealSection>
        </div>

        {/* sticky rail */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <ScheduleVisitForm property={p} agent={agent} />
          <AgentCard agent={agent} />
          <div className="rounded-card border border-brass/40 bg-brasssoft/25 p-5">
            <p className="font-display text-[16px] font-semibold text-ink">Buying with a mortgage?</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink/65">
              At 20% down and 6.1% APR, this home runs about <strong className="text-ink">{money(Math.round((p.price * 0.8 * 0.0061) / (1 - Math.pow(1.0061, -360))))}/mo</strong>. Our partner lenders pre-approve in 24h.
            </p>
          </div>
        </aside>
      </div>

      <SimilarSection propertyId={p.id} />
    </main>
  );
}

function RevealSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <Kicker>{title}</Kicker>
      {children}
    </section>
  );
}
