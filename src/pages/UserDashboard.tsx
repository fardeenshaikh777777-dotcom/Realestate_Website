import React, { useCallback, useEffect, useState } from "react";
import { Link, useRoute } from "../router";
import * as api from "../lib/api";
import { cx, prettyDateLong } from "../lib/format";
import { emitAuth, emitFavorites, toast, useSession } from "../lib/store";
import type { Booking, Inquiry, Property } from "../lib/types";
import { DashShell, RequireAuth, type DashTab } from "../components/layout";
import { PropertyCard, PropertyCardSkeleton } from "../components/property";
import { Button, ConfirmDialog, EmptyState, Field, Input, Monogram, Skeleton, StatusBadge } from "../components/ui";
import { ICalendar, IHeart, IMail, IPin, IUserI } from "../components/icons";

const TABS: DashTab[] = [
  { id: "saved", label: "Saved homes", icon: <IHeart className="h-4.5 w-4.5" /> },
  { id: "visits", label: "My visits", icon: <ICalendar className="h-4.5 w-4.5" /> },
  { id: "inquiries", label: "Inquiries", icon: <IMail className="h-4.5 w-4.5" /> },
  { id: "profile", label: "Profile", icon: <IUserI className="h-4.5 w-4.5" /> },
];

export function UserDashboardPage() {
  return (
    <RequireAuth roles={["BUYER", "AGENT", "ADMIN"]} label="your dashboard">
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const session = useSession()!;
  const route = useRoute();
  const [tab, setTab] = useState(route.query.get("tab") ?? "saved");

  useEffect(() => {
    const t = route.query.get("tab");
    if (t) setTab(t);
  }, [route.query]);

  return (
    <DashShell
      title={`Good day, ${session.name.split(" ")[0]}`}
      subtitle="Buyer dashboard"
      tabs={TABS}
      active={tab}
      onTab={setTab}
    >
      {tab === "saved" && <SavedTab userId={session.id} />}
      {tab === "visits" && <VisitsTab userId={session.id} />}
      {tab === "inquiries" && <InquiriesTab userId={session.id} />}
      {tab === "profile" && <ProfileTab />}
    </DashShell>
  );
}

/* --------------------------------- saved ---------------------------------- */

function SavedTab({ userId }: { userId: string }) {
  const [items, setItems] = useState<Property[] | null>(null);

  const load = useCallback(() => {
    setItems(null);
    api.getSavedProperties(userId).then(setItems);
  }, [userId]);

  useEffect(load, [load]);

  if (items === null) {
    return <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((i) => <PropertyCardSkeleton key={i} />)}</div>;
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<IHeart className="h-6 w-6" />}
        title="No saved homes yet"
        body="Tap the heart on any listing to keep it here. Your shortlist syncs to this account."
        action={<Button to="/listings" variant="brass">Browse listings</Button>}
      />
    );
  }
  return (
    <div className="anim-fade grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((p) => <PropertyCard key={p.id} p={p} />)}
    </div>
  );
}

/* --------------------------------- visits ---------------------------------- */

function VisitsTab({ userId }: { userId: string }) {
  const [rows, setRows] = useState<{ booking: Booking; property: Property | null }[] | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const load = useCallback(() => {
    setRows(null);
    api.listBookings({ userId }).then(setRows);
  }, [userId]);

  useEffect(load, [load]);

  if (rows === null) {
    return <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-card" />)}</div>;
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<ICalendar className="h-6 w-6" />}
        title="No tours booked"
        body="When you schedule a visit on any listing it appears here with its confirmation status."
        action={<Button to="/listings" variant="brass">Find a home to tour</Button>}
      />
    );
  }
  return (
    <div className="anim-fade space-y-4">
      {rows.map(({ booking: b, property: p }) => (
        <div key={b.id} className="flex flex-wrap items-center gap-4 rounded-card border border-mist bg-card p-4 transition-all hover:border-ink/25 hover:shadow-soft sm:flex-nowrap">
          {p && (
            <Link to={`/property/${p.id}`} className="block h-16 w-20 shrink-0 overflow-hidden rounded-lg">
              <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <Link to={p ? `/property/${p.id}` : "#"} className="font-display text-[16px] font-semibold text-ink hover:text-moss">{p?.title ?? "Listing removed"}</Link>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-semibold text-ink/55">
              <span className="flex items-center gap-1"><ICalendar className="h-3.5 w-3.5 text-brass" /> {prettyDateLong(b.date)}</span>
              <span>{b.time}</span>
              {p && <span className="flex items-center gap-1"><IPin className="h-3.5 w-3.5 text-brass" /> {p.city}, {p.state}</span>}
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
          {b.status !== "CANCELLED" && (
            <Button variant="paper" size="sm" onClick={() => setCancelId(b.id)}>Cancel</Button>
          )}
        </div>
      ))}
      {cancelId && (
        <ConfirmDialog
          title="Cancel this tour?"
          body="The agent will be notified and the slot released. You can always book another time."
          confirmLabel="Cancel tour"
          onCancel={() => setCancelId(null)}
          onConfirm={async () => {
            await api.setBookingStatus(cancelId, "CANCELLED");
            setCancelId(null);
            toast("Tour cancelled.", "info");
            load();
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------- inquiries -------------------------------- */

function InquiriesTab({ userId }: { userId: string }) {
  const [rows, setRows] = useState<{ inquiry: Inquiry; property: Property | null }[] | null>(null);

  useEffect(() => {
    let on = true;
    api.listInquiries({ userId }).then((r) => on && setRows(r));
    return () => { on = false; };
  }, [userId]);

  if (rows === null) return <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-card" />)}</div>;
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<IMail className="h-6 w-6" />}
        title="No inquiries yet"
        body="Questions you send to agents about listings are archived here for easy follow-up."
        action={<Button to="/listings" variant="brass">Browse listings</Button>}
      />
    );
  }
  return (
    <div className="anim-fade space-y-4">
      {rows.map(({ inquiry: i, property: p }) => (
        <div key={i.id} className="rounded-card border border-mist bg-card p-5 transition-all hover:border-ink/25 hover:shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link to={p ? `/property/${p.id}` : "#"} className="font-display text-[16px] font-semibold text-ink hover:text-moss">
              {p?.title ?? "Listing removed"}
            </Link>
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-ink/40">sent {prettyDateLong(i.createdAt)}</span>
          </div>
          <p className="mt-2 rounded-xl bg-mistsoft/70 px-4 py-3 text-[13.5px] leading-relaxed text-ink/75">“{i.message}”</p>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- profile --------------------------------- */

function ProfileTab() {
  const session = useSession()!;
  const [name, setName] = useState(session.name);
  const [phone, setPhone] = useState(session.phone);
  const [busy, setBusy] = useState(false);

  return (
    <div className="anim-fade max-w-xl">
      <div className="rounded-card border border-mist bg-card p-6">
        <div className="flex items-center gap-4 border-b border-mistsoft pb-5">
          <Monogram name={session.name} size="lg" />
          <div>
            <p className="font-display text-lg font-semibold text-ink">{session.name}</p>
            <p className="text-[13px] text-ink/55">{session.email}</p>
            <span className="mt-1 inline-block rounded-full bg-pine px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brasssoft">{session.role.toLowerCase()}</span>
          </div>
        </div>
        <form
          className="mt-5 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await api.updateProfile(session.id, { name, phone });
              emitAuth();
              emitFavorites();
              toast("Profile updated.");
            } catch (err) {
              toast(err instanceof Error ? err.message : "Couldn't save.", "error");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 000-0000" /></Field>
          <Field label="Email" hint="sign-in email can't change in the demo"><Input value={session.email} disabled className="opacity-60" /></Field>
          <Button type="submit" variant="brass" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
        </form>
      </div>
      <p className="mt-4 text-[12.5px] text-ink/45">Member since {prettyDateLong(session.joinedOn)}</p>
    </div>
  );
}
