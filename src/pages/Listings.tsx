import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRoute } from "../router";
import * as api from "../lib/api";
import { cx } from "../lib/format";
import type { Property, SortKey } from "../lib/types";
import { FiltersPanel, MapView, PropertyCard, PropertyCardSkeleton, SearchBar, type FiltersState } from "../components/property";
import { Button, EmptyState, Select } from "../components/ui";
import { IGrid, IList, IMap, ISearch, ISliders, IX } from "../components/icons";

const PER_PAGE = 6;

function filtersFromQuery(query: URLSearchParams): FiltersState {
  return {
    q: query.get("q") ?? "",
    city: query.get("city") ?? "any",
    type: (query.get("type") as FiltersState["type"]) ?? "any",
    min: Number(query.get("min") ?? 0),
    max: Number(query.get("max") ?? 10_000_000),
    beds: Number(query.get("beds") ?? 0),
    baths: Number(query.get("baths") ?? 0),
    status: (query.get("status") as FiltersState["status"]) ?? "any",
    sort: (query.get("sort") as SortKey) ?? "newest",
  };
}

export function ListingsPage() {
  const route = useRoute();
  const [filters, setFilters] = useState<FiltersState>(() => filtersFromQuery(route.query));
  const [items, setItems] = useState<Property[] | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [view, setView] = useState<"grid" | "list" | "map">("grid");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const fetchSeq = useRef(0);

  // sync when arriving via footer/home links while already on this page
  const queryKey = route.query.toString();
  useEffect(() => {
    setFilters(filtersFromQuery(new URLSearchParams(queryKey)));
  }, [queryKey]);

  const doFetch = useCallback(
    async (pg: number, append: boolean) => {
      const seq = ++fetchSeq.current;
      if (!append) setItems(null);
      else setLoadingMore(true);
      const res = await api.listProperties(filters, pg, view === "map" ? 60 : PER_PAGE);
      if (seq !== fetchSeq.current) return;
      setItems(res.items);
      setTotal(res.total);
      setHasMore(res.hasMore);
      setLoadingMore(false);
    },
    [filters, view]
  );

  useEffect(() => {
    setPage(1);
    doFetch(1, false);
  }, [doFetch]);

  const loadMore = async () => {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    const res = await api.listProperties(filters, next, PER_PAGE);
    setItems((prev) => (prev ? [...prev, ...res.items] : res.items));
    setHasMore(res.hasMore);
    setLoadingMore(false);
  };

  const statusLabel = useMemo(() => {
    if (filters.status === "rented") return "rentals";
    if (filters.status === "sold") return "recently sold homes";
    return "homes for sale";
  }, [filters.status]);

  const activeCount = [
    filters.city !== "any", filters.type !== "any", filters.min > 0, filters.max < 10_000_000,
    filters.beds > 0, filters.baths > 0, filters.q !== "",
  ].filter(Boolean).length;

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brass">
            <span className="h-px w-8 bg-brass/70" /> The collection
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {filters.city !== "any" ? `${statusLabel[0].toUpperCase()}${statusLabel.slice(1)} in ${filters.city}` : `All ${statusLabel}`}
          </h1>
          <p className="mt-2 text-[13.5px] font-semibold text-ink/55" aria-live="polite">
            {items === null ? "Searching the collection…" : `${total} home${total === 1 ? "" : "s"} found${filters.q ? ` for “${filters.q}”` : ""}`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-full border border-mist bg-card p-1">
            {([["grid", "Grid", <IGrid key="g" className="h-4 w-4" />], ["list", "List", <IList key="l" className="h-4 w-4" />], ["map", "Map", <IMap key="m" className="h-4 w-4" />]] as const).map(
              ([v, label, icon]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cx(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold transition-all",
                    view === v ? "bg-pine text-paper shadow-soft" : "text-ink/55 hover:text-ink"
                  )}
                  aria-pressed={view === v}
                >
                  {icon}<span className="hidden sm:inline">{label}</span>
                </button>
              )
            )}
          </div>
          <Select value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as SortKey }))} className="w-44" aria-label="Sort listings">
            <option value="newest">Newest first</option>
            <option value="price-asc">Price · low to high</option>
            <option value="price-desc">Price · high to low</option>
            <option value="area-desc">Largest first</option>
          </Select>
        </div>
      </div>

      <div className="mt-5"><SearchBar compact /></div>

      <button
        onClick={() => setMobileFilters((v) => !v)}
        className="mt-6 flex w-full items-center justify-between rounded-xl border border-mist bg-card px-4 py-3 text-[13.5px] font-bold text-ink lg:hidden"
        aria-expanded={mobileFilters}
      >
        <span className="flex items-center gap-2"><ISliders className="h-4.5 w-4.5 text-brass" /> Filters {activeCount > 0 && <span className="rounded-full bg-brass px-2 py-0.5 text-[11px] font-bold text-pinedeep">{activeCount}</span>}</span>
        {mobileFilters ? <IX className="h-4.5 w-4.5" /> : <ISliders className="h-4.5 w-4.5" />}
      </button>

      <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* sidebar */}
        <aside className={cx("lg:sticky lg:top-24 lg:h-fit lg:block", mobileFilters ? "block" : "hidden")} aria-label="Filters">
          <FiltersPanel filters={filters} onChange={setFilters} />
        </aside>

        {/* results */}
        <div className="min-w-0">
          {view === "map" ? (
            <MapLayout items={items} hoveredId={hoveredId} setHoveredId={setHoveredId} />
          ) : items === null ? (
            <div className={cx("grid gap-6", view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
              {[1, 2, 3, 4, 5, 6].map((i) => <PropertyCardSkeleton key={i} view={view} />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<ISearch className="h-6 w-6" />}
              title="Nothing matches that search"
              body="Try widening the price range or clearing a filter — great homes hide in unexpected places."
              action={<Button variant="primary" onClick={() => setFilters({ q: "", city: "any", type: "any", min: 0, max: 10_000_000, beds: 0, baths: 0, status: "any", sort: "newest" })}>Clear all filters</Button>}
            />
          ) : (
            <>
              <div className={cx("grid gap-6", view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
                {items.map((p, i) => (
                  <div key={p.id} className="anim-fade" style={{ animationDelay: `${Math.min(i % PER_PAGE, 6) * 60}ms` }}>
                    <PropertyCard p={p} view={view} onHover={setHoveredId} />
                  </div>
                ))}
                {loadingMore && [1, 2, 3].map((i) => <PropertyCardSkeleton key={`s${i}`} view={view} />)}
              </div>
              <div className="mt-10 flex flex-col items-center gap-2">
                <p className="text-[12.5px] font-semibold text-ink/45">
                  Showing {items.length} of {total}
                </p>
                {hasMore && (
                  <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? "Loading…" : "Load more homes"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function MapLayout({ items, hoveredId, setHoveredId }: { items: Property[] | null; hoveredId: string | null; setHoveredId: (id: string | null) => void }) {
  if (items === null) {
    return (
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">{[1, 2, 3].map((i) => <PropertyCardSkeleton key={i} view="list" />)}</div>
        <div className="skeleton min-h-[480px] rounded-card" />
      </div>
    );
  }
  if (items.length === 0) {
    return <EmptyState icon={<IMap className="h-6 w-6" />} title="No pins to drop" body="Nothing matches those filters on the map. Loosen the price range or search all locations." />;
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="no-scrollbar max-h-[620px] space-y-4 overflow-y-auto pr-1">
        {items.map((p) => (
          <div
            key={p.id}
            onMouseEnter={() => setHoveredId(p.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cx("transition-all duration-200", hoveredId === p.id && "scale-[1.015]")}
          >
            <PropertyCard p={p} view="list" onHover={setHoveredId} />
          </div>
        ))}
      </div>
      <div className="lg:sticky lg:top-24 lg:h-[620px]">
        <MapView items={items} activeId={hoveredId} onHover={setHoveredId} className="h-[440px] lg:h-full" />
      </div>
    </div>
  );
}
