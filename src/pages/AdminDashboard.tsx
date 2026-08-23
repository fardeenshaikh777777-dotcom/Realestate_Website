import React, { useCallback, useEffect, useState } from "react";
import { Link } from "../router";
import * as api from "../lib/api";
import { cx, money, moneyShort, prettyDate } from "../lib/format";
import { toast, useSession } from "../lib/store";
import type { ListingStatus, Property, Role, User } from "../lib/types";
import { DashShell, RequireAuth, type DashTab } from "../components/layout";
import { Button, ConfirmDialog, EmptyState, Select, Skeleton, StatusBadge } from "../components/ui";
import { IArrowUR, IBuilding, ICheck, IEye, IMail, IShield, ITrash, ITrend, IUsers, IWarn, IX } from "../components/icons";

const TABS: DashTab[] = [
  { id: "overview", label: "Overview", icon: <ITrend className="h-4.5 w-4.5" /> },
  { id: "approvals", label: "Approvals", icon: <IShield className="h-4.5 w-4.5" /> },
  { id: "listings", label: "All listings", icon: <IBuilding className="h-4.5 w-4.5" /> },
  { id: "users", label: "Users", icon: <IUsers className="h-4.5 w-4.5" /> },
];

export function AdminDashboardPage() {
  return (
    <RequireAuth roles={["ADMIN"]} label="the admin panel">
      <Shell />
    </RequireAuth>
  );
}

function Shell() {
  const [tab, setTab] = useState("overview");
  return (
    <DashShell title="Mission control" subtitle="Admin panel" tabs={TABS} active={tab} onTab={setTab}>
      {tab === "overview" && <Overview onGoApprovals={() => setTab("approvals")} />}
      {tab === "approvals" && <Approvals />}
      {tab === "listings" && <AllListings />}
      {tab === "users" && <Users />}
    </DashShell>
  );
}

/* --------------------------------- overview -------------------------------- */

function Overview({ onGoApprovals }: { onGoApprovals: () => void }) {
  const [stats, setStats] = useState<{ listings: number; pending: number; users: number; inquiries: number; bookings: number; views: number; volume: number } | null>(null);

  useEffect(() => {
    let on = true;
    api.platformStats().then((r) => on && setStats(r));
    return () => { on = false; };
  }, []);

  if (!stats) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-card" />)}</div>;

  const cards = [
    { label: "Total listings", value: String(stats.listings), note: `${stats.pending} awaiting approval`, alert: stats.pending > 0 },
    { label: "Live volume", value: moneyShort(stats.volume), note: "active for-sale asking" },
    { label: "Platform views", value: stats.views.toLocaleString(), note: "all listings, 90 days" },
    { label: "Members", value: String(stats.users), note: `${stats.inquiries} inquiries · ${stats.bookings} tours` },
  ];

  return (
    <div className="anim-fade space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-card border border-mist bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/45">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">{c.value}</p>
            <p className={cx("mt-1 flex items-center gap-1.5 text-[12px] font-semibold", c.alert ? "text-brassdeep" : "text-ink/45")}>
              {c.alert && <IWarn className="h-3.5 w-3.5" />} {c.note}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-brass/40 bg-brasssoft/20 px-6 py-5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brass text-pinedeep"><IShield className="h-6 w-6" /></span>
          <div>
            <p className="font-display text-lg font-semibold text-ink">{stats.pending} listing{stats.pending === 1 ? " is" : "s are"} waiting for review</p>
            <p className="text-[13px] text-ink/55">Approve to publish, or reject to send back to the agent.</p>
          </div>
        </div>
        <Button variant="brass" onClick={onGoApprovals}>Open approvals queue</Button>
      </div>
    </div>
  );
}

/* --------------------------------- approvals -------------------------------- */

function Approvals() {
  const [rows, setRows] = useState<{ property: Property; agent: User | null }[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setRows(null);
    api.listPending().then(setRows);
  }, []);

  useEffect(load, [load]);

  const decide = async (p: Property, status: "available" | "rejected") => {
    setBusyId(p.id);
    try {
      await api.setPropertyStatus(p.id, status);
      toast(status === "available" ? `“${p.title}” is now live on the marketplace.` : `“${p.title}” rejected — the agent has been notified.`, status === "available" ? "success" : "info");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Action failed.", "error");
    }
    setBusyId(null);
    load();
  };

  if (rows === null) return <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-card" />)}</div>;
  if (rows.length === 0) {
    return <EmptyState icon={<ICheck className="h-6 w-6" />} title="Queue is clear" body="Nothing waiting for review. New agent submissions will appear here before going live." />;
  }

  return (
    <div className="anim-fade space-y-5">
      {rows.map(({ property: p, agent }) => (
        <div key={p.id} className="overflow-hidden rounded-card border border-mist bg-card transition-all hover:border-ink/25 hover:shadow-soft">
          <div className="flex flex-col sm:flex-row">
            <div className="relative h-52 sm:h-auto sm:w-72 sm:shrink-0">
              <img src={p.images[0]} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute left-3 top-3"><StatusBadge status={p.status} /></span>
            </div>
            <div className="flex-1 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1 text-[13px] font-semibold text-ink/55">
                    {p.address} · {p.city}, {p.state} · submitted by {agent?.name ?? "unknown agent"} · {prettyDate(p.listedOn)}
                  </p>
                </div>
                <p className="font-display text-xl font-semibold text-moss">{money(p.price)}</p>
              </div>
              <p className="mt-3 line-clamp-2 text-[13.5px] leading-relaxed text-ink/65">{p.description}</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button onClick={() => decide(p, "available")} disabled={busyId === p.id} className="flex h-10 items-center gap-2 rounded-full bg-moss px-5 text-[13px] font-bold text-paper transition-colors hover:bg-pine disabled:opacity-50">
                  <ICheck className="h-4 w-4" /> Approve & publish
                </button>
                <button onClick={() => decide(p, "rejected")} disabled={busyId === p.id} className="flex h-10 items-center gap-2 rounded-full border border-clay/40 px-5 text-[13px] font-bold text-clay transition-colors hover:bg-clay hover:text-paper disabled:opacity-50">
                  <IX className="h-4 w-4" /> Reject
                </button>
                <Link to={`/property/${p.id}`} className="flex h-10 items-center gap-2 rounded-full border border-ink/15 px-5 text-[13px] font-bold text-ink transition-all hover:border-ink hover:bg-ink hover:text-paper">
                  Preview <IArrowUR className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- all listings ------------------------------ */

function AllListings() {
  const [rows, setRows] = useState<Property[] | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);

  const load = useCallback(() => {
    setRows(null);
    api.listAllProperties().then(setRows);
  }, []);

  useEffect(load, [load]);

  if (rows === null) return <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-card" />)}</div>;

  return (
    <div className="anim-fade space-y-3">
      {rows.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-card border border-mist bg-card p-3.5 transition-all hover:border-ink/25 hover:shadow-soft sm:flex-nowrap">
          <Link to={`/property/${p.id}`} className="block h-14 w-20 shrink-0 overflow-hidden rounded-lg">
            <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link to={`/property/${p.id}`} className="font-display text-[15px] font-semibold text-ink hover:text-moss">{p.title}</Link>
            <p className="text-[12px] font-semibold text-ink/50">{moneyShort(p.price)} · {p.city} · <IEye className="inline h-3.5 w-3.5" /> {p.views.toLocaleString()}</p>
          </div>
          <StatusBadge status={p.status} className="hidden sm:inline-flex" />
          <Select
            value={p.status}
            onChange={async (e) => {
              try {
                await api.setPropertyStatus(p.id, e.target.value as ListingStatus);
                toast(`“${p.title}” set to ${e.target.value}.`, "info");
                load();
              } catch (err) {
                toast(err instanceof Error ? err.message : "Couldn't update status.", "error");
              }
            }}
            className="w-40"
            aria-label={`Change status of ${p.title}`}
          >
            <option value="available">For sale</option>
            <option value="rented">Rented</option>
            <option value="sold">Sold</option>
            <option value="pending">Pending review</option>
            <option value="rejected">Rejected</option>
          </Select>
          <button onClick={() => setDeleting(p)} className="flex h-9 w-9 items-center justify-center rounded-full border border-clay/30 text-clay transition-colors hover:bg-clay hover:text-paper" aria-label={`Delete ${p.title}`}>
            <ITrash className="h-4 w-4" />
          </button>
        </div>
      ))}
      {deleting && (
        <ConfirmDialog
          title={`Delete “${deleting.title}”?`}
          body="This permanently removes the listing and its related data from the platform."
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

/* ---------------------------------- users ---------------------------------- */

function Users() {
  const session = useSession()!;
  const [rows, setRows] = useState<(User & { listings: number })[] | null>(null);
  const [removing, setRemoving] = useState<User | null>(null);

  const load = useCallback(() => {
    setRows(null);
    api.listUsers().then(setRows);
  }, []);

  useEffect(load, [load]);

  if (rows === null) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-card" />)}</div>;

  return (
    <div className="anim-fade space-y-3">
      {rows.map((u) => (
        <div key={u.id} className={cx("flex flex-wrap items-center gap-4 rounded-card border bg-card p-4 transition-all hover:shadow-soft sm:flex-nowrap", u.id === session.id ? "border-brass/50" : "border-mist hover:border-ink/25")}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine font-display text-[14px] font-semibold text-brasssoft">
            {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-bold text-ink">
              {u.name} {u.id === session.id && <span className="ml-1 rounded-full bg-brasssoft/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brassdeep">you</span>}
            </p>
            <p className="text-[12.5px] font-semibold text-ink/50">{u.email} · joined {prettyDate(u.joinedOn)}{u.role === "AGENT" ? ` · ${u.listings} listings` : ""}</p>
          </div>
          <Select
            value={u.role}
            disabled={u.id === session.id}
            onChange={async (e) => {
              try {
                await api.setUserRole(u.id, e.target.value as Role);
                toast(`${u.name} is now ${e.target.value.toLowerCase()}.`, "info");
                load();
              } catch (err) {
                toast(err instanceof Error ? err.message : "Couldn't change role.", "error");
              }
            }}
            className="w-32"
            aria-label={`Change role for ${u.name}`}
          >
            <option value="BUYER">Buyer</option>
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <button
            onClick={() => setRemoving(u)}
            disabled={u.id === session.id}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-clay/30 text-clay transition-colors hover:bg-clay hover:text-paper disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={`Remove ${u.name}`}
          >
            <ITrash className="h-4 w-4" />
          </button>
        </div>
      ))}
      {removing && (
        <ConfirmDialog
          title={`Remove ${removing.name}?`}
          body="Their account will be deleted. Listings they own remain on the platform unassigned."
          confirmLabel="Remove user"
          onCancel={() => setRemoving(null)}
          onConfirm={async () => {
            try {
              await api.removeUser(removing.id);
              toast(`${removing.name} removed.`, "info");
            } catch (err) {
              toast(err instanceof Error ? err.message : "Couldn't remove user.", "error");
            }
            setRemoving(null);
            load();
          }}
        />
      )}
    </div>
  );
}
