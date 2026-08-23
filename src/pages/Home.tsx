import React, { useEffect, useRef, useState } from "react";
import { Link, navigate } from "../router";
import * as api from "../lib/api";
import { cx, money, moneyShort } from "../lib/format";
import { IMG, RECENT_SALES, TESTIMONIALS } from "../lib/data";
import type { Property } from "../lib/types";
import { PropertyCard, PropertyCardSkeleton, SearchBar } from "../components/property";
import { Button, CountUp, Kicker, Monogram, Reveal, SectionHead, Skeleton } from "../components/ui";
import { IArrowR, IArrowUR, IChevL, IChevR, ICompass, IDoor, IKey, IPin, IStar, ITrend } from "../components/icons";

const HERO_IMAGE = IMG.pool;

export function HomePage() {
  const [featured, setFeatured] = useState<Property[] | null>(null);
  const [typeCounts, setTypeCounts] = useState<Record<string, number> | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let on = true;
    api.getFeatured(6).then((r) => on && setFeatured(r));
    api.getTypeCounts().then((r) => on && setTypeCounts(r));
    return () => { on = false; };
  }, []);

  const scrollRail = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 720), behavior: "smooth" });
  };

  const heroListing = featured?.[0];

  return (
    <main>
      {/* ------------------------------- hero ------------------------------- */}
      <section className="relative overflow-hidden">
        {/* ambient architectural backdrop */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(var(--color-mistsoft)_1px,transparent_1px),linear-gradient(90deg,var(--color-mistsoft)_1px,transparent_1px)] bg-[size:56px_56px] opacity-60 [mask-image:radial-gradient(75%_70%_at_50%_30%,black,transparent)]" />
          <div className="absolute -right-40 top-16 h-[34rem] w-[34rem] rounded-full border-[30px] border-mist/70" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full border-[20px] border-mist/60" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24 lg:pt-40">
          <div className="flex flex-col justify-center">
            <p className="mask-line text-[11px] font-bold uppercase tracking-[0.26em] text-brass">
              <span style={{ ["--d" as string]: "60ms" }}>Curated homes · 48 cities · est. 2016</span>
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-[1.02] tracking-tight text-ink">
              <span className="mask-line"><span style={{ ["--d" as string]: "140ms" }}>Find the door</span></span>
              <span className="mask-line"><span style={{ ["--d" as string]: "260ms" }}>that fits</span></span>
              <span className="mask-line"><span style={{ ["--d" as string]: "380ms" }} className="text-moss italic">your life.</span></span>
            </h1>
            <p className="anim-fade mt-6 max-w-md text-[15px] leading-relaxed text-ink/60" style={{ animationDelay: "500ms" }}>
              Every Atrium listing is walked, photographed and written up by an agent who'd live there themselves. Search the collection — no noise, no duplicates, no bots.
            </p>

            <div className="anim-fade mt-8" style={{ animationDelay: "620ms" }}>
              <SearchBar />
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-ink/55">
                <span className="text-ink/40">Popular:</span>
                {[
                  ["Santa Fe adobes", "/listings?city=Santa%20Fe"],
                  ["Cabins", "/listings?type=cabin"],
                  ["Under $700K", "/listings?max=700000"],
                  ["Lofts", "/listings?type=loft"],
                ].map(([label, to]) => (
                  <Link key={label} to={to} className="rounded-full border border-ink/15 bg-card px-3 py-1.5 transition-all hover:border-brass hover:text-brassdeep">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* hero visual */}
          <div className="anim-fade relative" style={{ animationDelay: "300ms" }}>
            <div className="absolute -left-5 top-8 hidden h-full w-full rounded-2xl border-2 border-brass/50 lg:block" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl shadow-lift">
              <img src={HERO_IMAGE} alt="Bougainvillea Courtyard — mid-century pool house in Palm Springs" className="kb-img aspect-[4/4.4] w-full object-cover sm:aspect-[16/11] lg:aspect-[4/4.6]" />
              <div className="absolute inset-0 bg-gradient-to-t from-pinedeep/70 via-transparent to-transparent" />
              {heroListing ? (
                <Link to={`/property/${heroListing.id}`} className="group absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-xl bg-paper/95 p-4 shadow-lift backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                  <span className="min-w-0">
                    <span className="block truncate font-display text-[16px] font-semibold text-ink">{heroListing.title}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[12px] font-semibold text-ink/55">
                      <IPin className="h-3.5 w-3.5 text-brass" /> {heroListing.district}, {heroListing.city}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-display text-lg font-semibold text-moss">{moneyShort(heroListing.price)}</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-paper transition-all group-hover:bg-brass group-hover:text-pinedeep">
                      <IArrowR className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              ) : (
                <div className="absolute bottom-4 left-4 right-4"><Skeleton className="h-16 w-full rounded-xl" /></div>
              )}
            </div>
            <div className="anim-float absolute -top-4 right-4 flex items-center gap-2 rounded-full bg-pine px-4 py-2.5 text-[12px] font-bold text-paper shadow-lift">
              <IStar className="h-4 w-4 text-brass" /> 4.9 agent rating
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ sales ticker ------------------------------ */}
      <div className="marquee overflow-hidden border-y border-pinedeep bg-pine py-3.5" aria-hidden="true">
        <div className="marquee-track flex items-center gap-10 pr-10">
          {[...RECENT_SALES, ...RECENT_SALES].map((s, i) => (
            <span key={i} className="flex shrink-0 items-center gap-3 text-[12.5px] font-semibold tracking-wide text-sagelight">
              <span className="rounded-full bg-brass px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-pinedeep">Closed</span>
              <span className="font-display text-[14px] text-paper">{s.title}</span>
              <span className="text-brasssoft">{money(s.price)}</span>
              <span className="text-sagelight/70">{s.city}</span>
              <span className="ml-6 h-1 w-1 rounded-full bg-brass/60" />
            </span>
          ))}
        </div>
      </div>

      {/* ------------------------------ featured rail ------------------------------ */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <SectionHead
          kicker="Hand-picked this week"
          title={<>Featured <em className="text-moss">listings</em></>}
          right={
            <div className="flex items-center gap-2.5">
              <button onClick={() => scrollRail(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-all hover:border-ink hover:bg-ink hover:text-paper" aria-label="Scroll featured listings left">
                <IChevL className="h-5 w-5" />
              </button>
              <button onClick={() => scrollRail(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-all hover:border-ink hover:bg-ink hover:text-paper" aria-label="Scroll featured listings right">
                <IChevR className="h-5 w-5" />
              </button>
            </div>
          }
        />
        <div ref={railRef} className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-2 sm:-mx-8 sm:px-8">
          {featured === null
            ? [1, 2, 3].map((i) => <div key={i} className="w-[86%] shrink-0 sm:w-[46%] lg:w-[31.5%]"><PropertyCardSkeleton /></div>)
            : featured.map((p) => (
                <div key={p.id} className="w-[86%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]">
                  <PropertyCard p={p} />
                </div>
              ))}
        </div>
      </section>

      {/* ------------------------------ type mosaic ------------------------------ */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:pb-24">
        <SectionHead kicker="Browse the collection" title={<>Every kind of <em className="text-moss">home</em></>} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6 lg:grid-rows-2">
          {typeMosaic(typeCounts).map((t, i) => (
            <Reveal key={t.type} delay={i * 70} className={cx("group relative overflow-hidden rounded-card", t.span)}>
              <Link to={`/listings?type=${t.type}`} className="relative block h-52 lg:h-full lg:min-h-56">
                <img src={t.img} alt={`${t.plural} for sale`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                <span className="absolute inset-0 bg-gradient-to-t from-pinedeep/85 via-pinedeep/20 to-transparent" />
                <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <span>
                    <span className="block font-display text-xl font-semibold text-paper lg:text-2xl">{t.plural}</span>
                    <span className="mt-0.5 block text-[12px] font-bold uppercase tracking-[0.14em] text-brasssoft">
                      {typeCounts ? `${typeCounts[t.type] ?? 0} listed` : "…"}
                    </span>
                  </span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper/15 text-paper backdrop-blur transition-all duration-300 group-hover:bg-brass group-hover:text-pinedeep">
                    <IArrowUR className="h-4.5 w-4.5" />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------ stats band ------------------------------ */}
      <section className="relative overflow-hidden bg-pinedeep py-16 text-paper lg:py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full border-[26px] border-pine/70" />
          <div className="absolute -bottom-28 right-0 h-96 w-96 rounded-full border-[30px] border-pine/50" />
        </div>
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-10 px-5 sm:px-8 lg:grid-cols-4">
          {[
            { v: 3200, suffix: "+", label: "Curated listings", note: "each one walked in person" },
            { v: 48, suffix: "", label: "Cities covered", note: "coast to coast" },
            { v: 96, suffix: "%", label: "Of asking achieved", note: "median, last 12 months" },
            { v: 2.4, suffix: "B", prefix: "$", decimals: 1, label: "Closed volume", note: "and counting since 2016" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <p className="font-display text-4xl font-semibold text-brasssoft lg:text-5xl">
                <CountUp to={s.v} prefix={s.prefix ?? ""} suffix={s.suffix} decimals={s.decimals ?? 0} />
              </p>
              <p className="mt-2 text-[14px] font-bold tracking-wide">{s.label}</p>
              <p className="mt-0.5 text-[12.5px] text-sagelight/70">{s.note}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------ how it works ------------------------------ */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <SectionHead kicker="No pressure, just process" title={<>How Atrium <em className="text-moss">works</em></>} />
        <ol className="grid gap-x-10 gap-y-12 md:grid-cols-3">
          {[
            { n: "01", icon: <ICompass className="h-6 w-6" />, title: "Search with taste", body: "Filter by type, light, district and price on a map that reads like a neighborhood, not a spreadsheet." },
            { n: "02", icon: <IKey className="h-6 w-6" />, title: "Tour on your schedule", body: "Request a visit in thirty seconds. Agents confirm within hours and meet you at the door — keys in hand." },
            { n: "03", icon: <IDoor className="h-6 w-6" />, title: "Close with confidence", body: "Disclosures, comps and inspection notes up front. 96% of asking, zero mystery fees." },
          ].map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 110} className="relative">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-5xl font-light text-brass/70 lg:text-6xl">{s.n}</span>
                <span className="h-px flex-1 bg-mist" />
                <span className="text-moss">{s.icon}</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-ink/60">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ------------------------------ testimonials ------------------------------ */}
      <section className="border-y border-mist bg-mistsoft/45 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHead kicker="Word of mouth" title={<>People who found <em className="text-moss">their door</em></>} />
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100} className={cx(i === 1 && "md:translate-y-8")}>
                <figure className="flex h-full flex-col rounded-card border border-mist bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <span className="font-display text-6xl leading-none text-brass/50">“</span>
                  <blockquote className="-mt-4 flex-1 font-display text-[17px] font-medium italic leading-relaxed text-ink/85">{t.quote}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-mistsoft pt-5">
                    <Monogram name={t.name} size="md" tone={i} />
                    <span>
                      <span className="block text-[14px] font-bold text-ink">{t.name}</span>
                      <span className="block text-[12.5px] font-semibold text-brassdeep">{t.detail}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ CTA banner ------------------------------ */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-pine px-7 py-14 text-center text-paper sm:px-14 lg:py-16">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full border-[22px] border-moss/40" />
              <div className="absolute -bottom-24 -right-12 h-72 w-72 rounded-full border-[26px] border-moss/30" />
            </div>
            <Kicker light>For owners & agents</Kicker>
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-[2.7rem]">
              Own a place worth <em className="text-brasssoft">showing off?</em>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-sagelight">
              List with Atrium and get editorial photography, a curated audience and a dashboard built for closings — not spreadsheets.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <Button variant="brass" size="lg" to="/auth?mode=register&role=agent">Create an agent account</Button>
              <Button size="lg" className="border border-paper/30 bg-transparent text-paper hover:bg-paper hover:text-pine" to="/contact?topic=selling">
                Talk to our team
              </Button>
            </div>
            <p className="mt-5 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-sagelight/70">
              <ITrend className="h-4 w-4 text-brasssoft" /> Agents close 31% faster on Atrium-listed homes
            </p>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

function typeMosaic(counts: Record<string, number> | null) {
  return [
    { type: "house", plural: "Houses", img: IMG.hero, span: "col-span-2 lg:col-span-4" },
    { type: "apartment", plural: "Apartments", img: IMG.cityview, span: "col-span-2 lg:col-span-2" },
    { type: "townhouse", plural: "Townhouses", img: IMG.townhouse, span: "col-span-1 lg:col-span-2" },
    { type: "villa", plural: "Villas", img: IMG.adobe, span: "col-span-1 lg:col-span-2" },
    { type: "cabin", plural: "Cabins & lofts", img: IMG.cabin, span: "col-span-2 lg:col-span-2" },
  ];
}
