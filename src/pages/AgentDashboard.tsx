import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "../router";
import * as api from "../lib/api";
import { cx, money, moneyShort, prettyDate, prettyDateLong, timeAgo } from "../lib/format";
import { toast, useSession } from "../lib/store";
import { ALL_IMAGES } from "../lib/data";
import { AMENITIES, PROPERTY_TYPES, type Booking, type Inquiry, type Property, type PropertyInput, type PropertyType } from "../lib/types";
import { DashShell, RequireAuth, type DashTab } from "../components/layout";
import { Button, ConfirmDialog, EmptyState, Field, Input, Modal, Select, Skeleton, StatusBadge, Textarea } from "../components/ui";
import { IArrowUR, IBuilding, ICalendar, ICheck, IEdit, IEye, IMail, IPlus, ITrend, ITrash } from "../components/icons";

const TABS: DashTab[] = [
  { id: "overview", label: "Overview", icon: <ITrend className="h-4.5 w-4.5" /> },
  { id: "listings", label: "My listings", icon: <IBuilding className="h-4.5 w-4.5" /> },
  { id: "leads", label: "Leads", icon: <IMail className="h-4.5 w-4.5" /> },
  { id: "visits", label: "Tours", icon: <ICalendar className="h-4.5 w-4.5" /> },
];

export function AgentDashboardPage() {
  return (
    <RequireAuth roles={["AGENT", "ADMIN"]} label="the agent dashboard">
      <Shell />
    </RequireAuth>
  );
}

function Shell() {
  const [tab, setTab] = useState("overview");
  const session = useSession()!;
  return (
    <DashShell title={`${session.name.split(" ")[0]}'s desk`} subtitle="Agent dashboard" tabs={TABS} active={tab} onTab={setTab}>
      {tab === "overview" && <Overview />}
      {tab === "listings" && <Listings />}
      {tab === "leads" && <Leads />}
      {tab === "visits" && <Tours />}
    </DashShell>
  );
}

/* --------------------------------- overview -------------------------------- */

function Overview() {
  const session = useSession()!;
  const [stats, setStats] = useState<{ listings: number; views: number; inquiries: number; bookings: number; series: number[] } | null>(null);
  const [leads, setLeads] = useState<{ inquiry: Inquiry; property: Property | null }[] | null>(null);

  useEffect(() => {
    let on = true;
    api.agentStats(session.id).then((r) => on && setStats(r));
    api.listInquiries({ agentId: session.id }).then((r) => on && setLeads(r.slice(0, 3)));
    return () => { on = false; };
  }, [session.id]);

  const cards = stats
    ? [
        { label: "Active listings", value: String(stats.listings), note: "incl. pending approval" },
        { label: "Listing views", value: stats.views.toLocaleString(), note: "last 90 days" },
        { label: "Leads received", value: String(stats.inquiries), note: "inbox inquiries" },
        { label: "Tours booked", value: String(stats.bookings), note: "all time" },
      ]
    : null;

  return (
    <div className="anim-fade space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards === null
          ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-card" />)
          : cards.map((c, i) => (
              <div key={c.label} className="group rounded-card border border-mist bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/45">{c.label}</p>
                <p className={cx("mt-2 font-display text-3xl font-semibold", i === 0 ? "text-moss" : "text-ink")}>{c.value}</p>
                <p className="mt-1 text-[12px] font-semibold text-ink/45">{c.note}</p>
              </div>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-card border border-mist bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">Views · last 8 weeks</h3>
              <p className="text-[12.5px] font-semibold text-ink/45">across all your listings</p>
            </div>
            {stats && (
              <span className="flex items-center gap-1.5 rounded-full bg-moss/10 px-3 py-1.5 text-[12px] font-bold text-moss">
                <ITrend className="h-3.5 w-3.5" /> +{Math.round(((stats.series[7] - stats.series[0]) / Math.max(1, stats.series[0])) * 100)}%
              </span>
            )}
          </div>
          {stats === null ? (
            <Skeleton className="mt-6 h-40 w-full" />
          ) : (
            <Sparkline data={stats.series} />
          )}
        </div>

        <div className="rounded-card border border-mist bg-card p-6">
          <h3 className="font-display text-lg font-semibold text-ink">Latest leads</h3>
          {leads === null ? (
            <div className="mt-4 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : leads.length === 0 ? (
            <p className="mt-4 text-[13.5px] text-ink/55">No leads yet — new inquiries land here instantly.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {leads.map(({ inquiry: i, property: p }) => (
                <li key={i.id} className="rounded-xl bg-mistsoft/60 px-4 py-3">
                  <p className="text-[13px] font-bold text-ink">{i.name} <span className="font-medium text-ink/45">on</span> {p?.title ?? "a removed listing"}</p>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink/60">{i.message}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-brassdeep">{timeAgo(i.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 520;
  const h = 160;
  const max = Math.max(...data) * 1.15;
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * w, h - (v / max) * h ] as const);
  const line = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h + 24}`} className="mt-6 w-full" role="img" aria-label="Weekly views trend">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="var(--color-mist)" strokeWidth="1" strokeDasharray="3 6" />
      ))}
      <polygon points={area} fill="var(--color-moss)" opacity="0.12" />
      <polyline points={line} fill="none" stroke="var(--color-moss)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === pts.length - 1 ? 5 : 3.5} fill={i === pts.length - 1 ? "var(--color-brass)" : "var(--color-paper)"} stroke="var(--color-moss)" strokeWidth="2" />
          <text x={x} y={h + 18} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-ink)" opacity="0.4">W{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

/* --------------------------------- listings -------------------------------- */

function Listings() {
  const session = useSession()!;
  const [items, setItems] = useState<Property[] | null>(null);
  const [editing, setEditing] = useState<Property | "new" | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);

  const load = useCallback(() => {
    setItems(null);
    api.listAgentProperties(session.id).then(setItems);
  }, [session.id]);

  useEffect(load, [load]);

  return (
    <div className="anim-fade">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink/55">{items === null ? "Loading your portfolio…" : `${items.length} listing${items.length === 1 ? "" : "s"} in your portfolio`}</p>
        <Button variant="brass" onClick={() => setEditing("new")}><IPlus className="h-4 w-4" strokeWidth={2.2} /> New listing</Button>
      </div>

      {items === null ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-card" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={<IBuilding className="h-6 w-6" />} title="No listings yet" body="Create your first listing — it goes to admin review, then live on the marketplace." action={<Button variant="brass" onClick={() => setEditing("new")}>Create a listing</Button>} />
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-card border border-mist bg-card p-4 transition-all hover:border-ink/25 hover:shadow-soft sm:flex-nowrap">
              <Link to={`/property/${p.id}`} className="block h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/property/${p.id}`} className="flex items-center gap-1.5 font-display text-[16px] font-semibold text-ink hover:text-moss">
                  {p.title} <IArrowUR className="h-3.5 w-3.5 text-brass" />
                </Link>
                <p className="mt-0.5 text-[12.5px] font-semibold text-ink/55">
                  {money(p.price)} · {p.city}, {p.state} · <span className="inline-flex items-center gap-1"><IEye className="h-3.5 w-3.5" />{p.views.toLocaleString()}</span> · listed {timeAgo(p.listedOn)}
                </p>
              </div>
              <StatusBadge status={p.status} />
              <div className="flex gap-2">
                <button onClick={() => setEditing(p)} className="flex h-9 items-center gap-1.5 rounded-full border border-ink/15 px-3.5 text-[12.5px] font-bold text-ink transition-all hover:border-ink hover:bg-ink hover:text-paper" aria-label={`Edit ${p.title}`}>
                  <IEdit className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => setDeleting(p)} className="flex h-9 items-center gap-1.5 rounded-full border border-clay/30 px-3.5 text-[12.5px] font-bold text-clay transition-all hover:bg-clay hover:text-paper" aria-label={`Delete ${p.title}`}>
                  <ITrash className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <PropertyForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={`Delete “${deleting.title}”?`}
          body="This removes the listing, its inquiries and scheduled tours permanently. There is no undo."
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await api.deleteProperty(deleting.id);
              toast("Listing deleted.", "info");
            } catch (err) {
              toast(err instanceof Error ? err.message : "Couldn't delete.", "error");
            }
            setDeleting(null);
            load();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------- property form ------------------------------ */

function PropertyForm({ initial, onClose, onSaved }: { initial: Property | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    price: initial?.price ? String(initial.price) : "",
    type: initial?.type ?? "house",
    beds: initial?.beds ?? 3,
    baths: initial?.baths ?? 2,
    area: initial?.area ? String(initial.area) : "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    district: initial?.district ?? "",
    yearBuilt: initial?.yearBuilt ? String(initial.yearBuilt) : "",
  });
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
  const [images, setImages] = useState<string[]>(initial?.images ?? [ALL_IMAGES[0].src]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const toggleAmenity = (a: string) =>
    setAmenities((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));

  const toggleImage = (src: string) =>
    setImages((cur) => {
      if (cur.includes(src)) return cur.length > 1 ? cur.filter((x) => x !== src) : cur;
      return cur.length >= 4 ? [...cur.slice(1), src] : [...cur, src];
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.title.trim().length < 4) errs.title = "Give it a proper name";
    if (!form.price || Number(form.price) <= 0) errs.price = "Enter a price";
    if (!form.address.trim()) errs.address = "Street address required";
    if (!form.city.trim()) errs.city = "City required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const input: PropertyInput = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      type: form.type as PropertyType,
      beds: Number(form.beds),
      baths: Number(form.baths),
      area: Number(form.area) || 1000,
      address: form.address,
      city: form.city,
      state: form.state || "—",
      district: form.district,
      yearBuilt: Number(form.yearBuilt) || new Date().getFullYear(),
      amenities,
      images,
    };
    setBusy(true);
    try {
      if (initial) {
        await api.updateProperty(initial.id, input);
        toast("Listing updated.");
      } else {
        await api.createProperty(input);
        toast("Listing submitted — pending admin approval.");
      }
      onSaved();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't save the listing.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={initial ? "Edit listing" : "New listing"} subtitle={initial ? initial.title : "Goes to admin review before publishing"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
          <Field label="Listing title" error={errors.title}>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="The Courtyard House" />
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="What makes this home worth writing about?" />
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Price ($)" error={errors.price}>
            <Input type="number" min={1} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="850000" />
          </Field>
          <Field label="Beds">
            <Select value={form.beds} onChange={(e) => set("beds", Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </Field>
          <Field label="Baths">
            <Select value={form.baths} onChange={(e) => set("baths", Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </Field>
          <Field label="Sq ft">
            <Input type="number" min={1} value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="1800" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Street address" error={errors.address}>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="14 Garland Ct" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" error={errors.city}>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Austin" />
            </Field>
            <Field label="State">
              <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="TX" />
            </Field>
            <Field label="Built">
              <Input type="number" value={form.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)} placeholder="1998" />
            </Field>
          </div>
        </div>

        <Field label="District / neighborhood">
          <Input value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="Hyde Park" />
        </Field>

        <div>
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.1em] text-ink/60">Photos · pick 1–4, first is the cover</p>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {ALL_IMAGES.map((img) => {
              const idx = images.indexOf(img.src);
              const selected = idx >= 0;
              return (
                <button
                  type="button"
                  key={img.src}
                  onClick={() => toggleImage(img.src)}
                  className={cx(
                    "group relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all",
                    selected ? "border-brass shadow-soft" : "border-transparent opacity-75 hover:opacity-100"
                  )}
                  aria-pressed={selected}
                  aria-label={img.label}
                >
                  <img src={img.src} alt={img.label} loading="lazy" className="h-full w-full object-cover" />
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brass text-[11px] font-bold text-pinedeep shadow-soft">
                      {idx === 0 ? "★" : idx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.1em] text-ink/60">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => toggleAmenity(a)}
                className={cx(
                  "rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-all",
                  amenities.includes(a) ? "border-pine bg-pine text-paper" : "border-ink/15 bg-card text-ink/60 hover:border-ink/40"
                )}
                aria-pressed={amenities.includes(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-mist pt-5">
          <Button type="button" variant="paper" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="brass" disabled={busy}>{busy ? "Saving…" : initial ? "Save changes" : "Submit for approval"}</Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------------------------- leads ---------------------------------- */

function Leads() {
  const session = useSession()!;
  const [rows, setRows] = useState<{ inquiry: Inquiry; property: Property | null }[] | null>(null);

  useEffect(() => {
    let on = true;
    api.listInquiries({ agentId: session.id }).then((r) => on && setRows(r));
    return () => { on = false; };
  }, [session.id]);

  if (rows === null) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-card" />)}</div>;
  if (rows.length === 0) {
    return <EmptyState icon={<IMail className="h-6 w-6" />} title="No leads yet" body="When buyers ask about your listings, their questions land here with full context." />;
  }
  return (
    <div className="anim-fade space-y-4">
      {rows.map(({ inquiry: i, property: p }) => (
        <div key={i.id} className="rounded-card border border-mist bg-card p-5 transition-all hover:border-ink/25 hover:shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine font-display text-[13px] font-semibold text-brasssoft">
                {i.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
              <div>
                <p className="text-[14.5px] font-bold text-ink">{i.name}</p>
                <p className="text-[12px] font-semibold text-ink/45">{i.email}</p>
              </div>
            </div>
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-brassdeep">{timeAgo(i.createdAt)}</span>
          </div>
          <p className="mt-3 rounded-xl bg-mistsoft/70 px-4 py-3 text-[13.5px] leading-relaxed text-ink/75">“{i.message}”</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[12.5px] font-semibold text-ink/55">
              Re: <Link to={p ? `/property/${p.id}` : "#"} className="font-bold text-moss hover:underline">{p?.title ?? "removed listing"}</Link> · {p ? moneyShort(p.price) : ""}
            </span>
            <a href={`mailto:${i.email}?subject=Re: ${encodeURIComponent(p?.title ?? "your Atrium inquiry")}`} className="flex h-9 items-center gap-2 rounded-full bg-pine px-4 text-[12.5px] font-bold text-paper transition-colors hover:bg-moss">
              <IMail className="h-3.5 w-3.5" /> Reply by email
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- tours ---------------------------------- */

function Tours() {
  const session = useSession()!;
  const [rows, setRows] = useState<{ booking: Booking; property: Property | null }[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setRows(null);
    api.listBookings({ agentId: session.id }).then(setRows);
  }, [session.id]);

  useEffect(load, [load]);

  const setStatus = async (id: string, status: "CONFIRMED" | "CANCELLED") => {
    setBusyId(id);
    await api.setBookingStatus(id, status);
    setBusyId(null);
    toast(status === "CONFIRMED" ? "Tour confirmed — the buyer has been notified." : "Tour cancelled.", status === "CONFIRMED" ? "success" : "info");
    load();
  };

  if (rows === null) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-card" />)}</div>;
  if (rows.length === 0) {
    return <EmptyState icon={<ICalendar className="h-6 w-6" />} title="No tours scheduled" body="Visit requests from your listings appear here, ready to confirm or decline." />;
  }
  return (
    <div className="anim-fade space-y-4">
      {rows.map(({ booking: b, property: p }) => (
        <div key={b.id} className="flex flex-wrap items-center gap-4 rounded-card border border-mist bg-card p-4 transition-all hover:border-ink/25 hover:shadow-soft sm:flex-nowrap">
          {p && (
            <Link to={`/property/${p.id}`} className="block h-16 w-20 shrink-0 overflow-hidden rounded-lg">
              <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-[16px] font-semibold text-ink">{b.name}</p>
            <p className="mt-0.5 text-[12.5px] font-semibold text-ink/55">
              {prettyDateLong(b.date)} at {b.time} · {p?.title ?? "removed listing"}
            </p>
          </div>
          <span className={cx(
            "rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider",
            b.status === "CONFIRMED" && "bg-moss/12 text-moss",
            b.status === "PENDING" && "bg-brass/15 text-brassdeep",
            b.status === "CANCELLED" && "bg-ink/8 text-ink/50"
          )}>
            {b.status.toLowerCase()}
          </span>
          {b.status === "PENDING" && (
            <div className="flex gap-2">
              <button onClick={() => setStatus(b.id, "CONFIRMED")} disabled={busyId === b.id} className="flex h-9 items-center gap-1.5 rounded-full bg-moss px-4 text-[12.5px] font-bold text-paper transition-colors hover:bg-pine disabled:opacity-50">
                <ICheck className="h-3.5 w-3.5" /> Confirm
              </button>
              <button onClick={() => setStatus(b.id, "CANCELLED")} disabled={busyId === b.id} className="flex h-9 items-center gap-1.5 rounded-full border border-clay/30 px-4 text-[12.5px] font-bold text-clay transition-colors hover:bg-clay hover:text-paper disabled:opacity-50">
                Decline
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
