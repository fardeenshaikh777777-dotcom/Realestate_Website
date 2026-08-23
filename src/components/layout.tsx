import React, { useEffect, useRef, useState } from "react";
import { Link, navigate, useRoute } from "../router";
import * as api from "../lib/api";
import { cx } from "../lib/format";
import { emitAuth, toast, useFavorites, useSession } from "../lib/store";
import { Button, Monogram } from "./ui";
import { IArrowR, IChevD, IHeart, ILogout, IMenu, ISend, IShield, IUserI, IX, LogoMark } from "./icons";

/* --------------------------------- Navbar --------------------------------- */

const NAV_LINKS = [
  { label: "Buy", to: "/listings", match: (r: { parts: string[]; query: URLSearchParams }) => r.parts[0] === "listings" && r.query.get("status") !== "rented" },
  { label: "Rent", to: "/listings?status=rented", match: (r: { parts: string[]; query: URLSearchParams }) => r.parts[0] === "listings" && r.query.get("status") === "rented" },
  { label: "Sell", to: "/contact?topic=selling", match: (r: { parts: string[] }) => false },
  { label: "About", to: "/about", match: (r: { parts: string[] }) => r.parts[0] === "about" },
  { label: "Contact", to: "/contact", match: (r: { parts: string[] }) => r.parts[0] === "contact" },
];

export function Navbar() {
  const route = useRoute();
  const session = useSession();
  const favorites = useFavorites();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [route.path, route.query.toString()]);

  const dashPath = session?.role === "ADMIN" ? "/admin" : session?.role === "AGENT" ? "/agent" : "/dashboard";

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-mist bg-paper/92 shadow-[0_4px_24px_-16px_rgba(22,35,29,0.3)] backdrop-blur-md" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-3" aria-label="Atrium Estates home">
          <LogoMark className="h-9 w-9 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="leading-none">
            <span className="block font-display text-[19px] font-semibold tracking-[0.14em] text-ink">ATRIUM</span>
            <span className="block text-[9.5px] font-bold uppercase tracking-[0.34em] text-brass">Estates</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => {
            const active = l.match(route);
            return (
              <Link
                key={l.label}
                to={l.to}
                className={cx(
                  "link-underline pb-0.5 text-[13.5px] font-semibold tracking-wide transition-colors",
                  active ? "is-active text-ink" : "text-ink/60 hover:text-ink"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (session) navigate("/dashboard?tab=saved");
              else {
                toast("Sign in to see your saved homes.", "info");
                navigate("/auth");
              }
            }}
            className="relative rounded-full p-2.5 text-ink/70 transition-colors hover:bg-ink/5 hover:text-clay"
            aria-label={`Saved homes (${favorites.length})`}
          >
            <IHeart className="h-5 w-5" filled={favorites.length > 0} />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-paper">
                {favorites.length}
              </span>
            )}
          </button>

          {session ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-ink/15 bg-card py-1 pl-1 pr-3 transition-all hover:border-ink/35"
                aria-expanded={userOpen}
                aria-label="Account menu"
              >
                <Monogram name={session.name} size="sm" />
                <span className="hidden text-[13px] font-semibold sm:block">{session.name.split(" ")[0]}</span>
                <IChevD className={cx("h-3.5 w-3.5 text-ink/50 transition-transform", userOpen && "rotate-180")} />
              </button>
              {userOpen && (
                <div className="anim-pop absolute right-0 top-[calc(100%+10px)] w-60 overflow-hidden rounded-xl border border-mist bg-card shadow-lift">
                  <div className="border-b border-mist bg-mistsoft/50 px-4 py-3">
                    <p className="text-sm font-bold text-ink">{session.name}</p>
                    <p className="text-[12px] text-ink/55">{session.email}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-pine px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brasssoft">
                      {session.role.toLowerCase()}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <Link to={dashPath} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold text-ink/80 transition-colors hover:bg-mistsoft hover:text-ink">
                      <IShield className="h-4 w-4 text-brass" /> {session.role === "BUYER" ? "My dashboard" : session.role === "AGENT" ? "Agent dashboard" : "Admin panel"}
                    </Link>
                    {session.role === "BUYER" && (
                      <Link to="/dashboard?tab=saved" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold text-ink/80 transition-colors hover:bg-mistsoft hover:text-ink">
                        <IHeart className="h-4 w-4 text-clay" /> Saved homes
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        await api.logout();
                        emitAuth();
                        setUserOpen(false);
                        toast("Signed out. See you at the next open house.");
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-semibold text-clay transition-colors hover:bg-clay/10"
                    >
                      <ILogout className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" to="/auth">Sign in</Button>
              <Button variant="brass" size="sm" to="/auth?mode=register">List a home</Button>
            </div>
          )}

          <button className="rounded-full p-2 text-ink lg:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen ? <IX className="h-6 w-6" /> : <IMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="anim-pop border-t border-mist bg-paper px-5 pb-6 pt-3 shadow-lift lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className="border-b border-mistsoft py-3.5 font-display text-lg font-semibold text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
          {!session && (
            <div className="mt-4 flex gap-3">
              <Button variant="outline" size="md" to="/auth" className="flex-1">Sign in</Button>
              <Button variant="brass" size="md" to="/auth?mode=register" className="flex-1">List a home</Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

/* --------------------------------- Footer --------------------------------- */

const FOOTER_COLS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Homes for sale", to: "/listings" },
      { label: "Rentals", to: "/listings?status=rented" },
      { label: "Recently sold", to: "/listings?status=sold" },
      { label: "New this week", to: "/listings?sort=newest" },
      { label: "Cabins & retreats", to: "/listings?type=cabin" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our story", to: "/about" },
      { label: "Meet the agents", to: "/about" },
      { label: "Careers", to: "/contact?topic=careers" },
      { label: "Press", to: "/about" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact us", to: "/contact" },
      { label: "Sell with Atrium", to: "/contact?topic=selling" },
      { label: "Privacy", to: "/legal/privacy" },
      { label: "Terms", to: "/legal/terms" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  return (
    <footer className="relative overflow-hidden bg-pinedeep text-paper">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border-[28px] border-pine/60" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full border-[22px] border-pine/40" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="h-10 w-10" />
              <span className="leading-none">
                <span className="block font-display text-xl font-semibold tracking-[0.14em]">ATRIUM</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.34em] text-brass">Estates</span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-sagelight/80">
              A curated marketplace for homes with character — every listing walked, photographed and written up by a person who cares.
            </p>
            <form
              className="mt-6 flex max-w-sm gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  toast("That email doesn't look right.", "error");
                  return;
                }
                toast("Subscribed — first dispatch lands Friday.");
                setEmail("");
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email for new listings"
                className="h-11 flex-1 rounded-full border border-paper/15 bg-paper/8 px-4 text-[13.5px] text-paper placeholder:text-sagelight/50 transition-colors focus:border-brass focus:outline-none"
                aria-label="Email address for newsletter"
              />
              <button type="submit" className="flex h-11 w-11 items-center justify-center rounded-full bg-brass text-pinedeep transition-all hover:bg-brasssoft" aria-label="Subscribe">
                <ISend className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

          {FOOTER_COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="link-underline text-[13.5px] font-medium text-sagelight/85 transition-colors hover:text-paper">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-paper/10 pt-6">
          <p className="text-[12px] text-sagelight/60">© 2026 Atrium Estates · A full-stack product demo — REST API simulated in-browser with localStorage.</p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => {
                api.resetDemoData();
                toast("Demo data reset to seed.", "info");
                window.setTimeout(() => window.location.reload(), 600);
              }}
              className="text-[12px] font-semibold text-sagelight/70 underline decoration-sagelight/30 underline-offset-4 transition-colors hover:text-paper"
            >
              Reset demo data
            </button>
            <Link to="/about" className="flex items-center gap-1.5 text-[12px] font-semibold text-brasssoft transition-colors hover:text-paper">
              Built with care <IArrowR className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------- RequireAuth ------------------------------ */

export function RequireAuth({ roles, children, label }: { roles?: ("BUYER" | "AGENT" | "ADMIN")[]; children: React.ReactNode; label: string }) {
  const session = useSession();
  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-5 pb-24 pt-40 text-center">
        <Monogram name="Guest Visitor" size="lg" tone={1} />
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">Sign in to view {label}</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/55">
          This area is reserved for signed-in members. Demo accounts are one click away on the sign-in page.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Button to="/auth" variant="primary">Sign in</Button>
          <Button to="/auth?mode=register" variant="outline">Create account</Button>
        </div>
      </div>
    );
  }
  if (roles && !roles.includes(session.role)) {
    return (
      <div className="mx-auto max-w-lg px-5 pb-24 pt-40 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clay/10 text-clay"><IUserI className="h-6 w-6" /></span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">Not enough keys for this door</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/55">
          {label} requires {roles.join(" or ")} access. You're signed in as {session.role.toLowerCase()} — try a demo account instead.
        </p>
        <Button to="/auth" variant="primary" className="mt-7">Switch account</Button>
      </div>
    );
  }
  return <>{children}</>;
}

/* --------------------------------- DashShell -------------------------------- */

export interface DashTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export function DashShell({
  title, subtitle, tabs, active, onTab, children,
}: {
  title: string;
  subtitle: string;
  tabs: DashTab[];
  active: string;
  onTab: (id: string) => void;
  children: React.ReactNode;
}) {
  const session = useSession();
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass">{subtitle}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
        </div>
        {session && (
          <div className="flex items-center gap-3 rounded-full border border-mist bg-card py-1.5 pl-1.5 pr-4">
            <Monogram name={session.name} size="sm" />
            <span className="text-[13px] font-semibold text-ink">{session.name}</span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:px-0" aria-label="Dashboard sections">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={cx(
                "flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-all lg:rounded-xl lg:border-transparent lg:px-4",
                active === t.id ? "border-pine bg-pine text-paper shadow-soft lg:text-paper" : "border-mist bg-card text-ink/60 hover:border-ink/30 hover:text-ink"
              )}
              aria-current={active === t.id ? "page" : undefined}
            >
              <span className={active === t.id ? "text-brasssoft" : "text-brass"}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
