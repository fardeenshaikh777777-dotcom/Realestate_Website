import React, { useState } from "react";
import { Link, useRoute } from "../router";
import { IMG, OFFICES } from "../lib/data";
import { toast } from "../lib/store";
import { Button, Field, Input, Kicker, Monogram, Reveal, SectionHead, Select, Textarea } from "../components/ui";
import { IArrowR, ICompass, IKey, ILeaf, IMail, IPhone, IPin, IShield, IClock } from "../components/icons";

/* ---------------------------------- About ---------------------------------- */

const TEAM = [
  { name: "Amara Chen", role: "Platform Director", note: "Keeps the marketplace honest — every listing, every word." },
  { name: "Daniel Reyes", role: "Senior Listing Agent", note: "143 closings. Will walk the roof line with you." },
  { name: "Priya Nair", role: "Broker, Urban Homes", note: "Lofts, flats and sky-high views. Replies in the hour." },
  { name: "Jonah Okafor", role: "Head of Photography", note: "Shoots every home at the hour it looks most like itself." },
];

const MILESTONES = [
  { year: "2016", text: "Founded in a two-desk Austin office with 14 hand-picked listings." },
  { year: "2019", text: "Crossed 1,000 curated homes and opened Charleston + Santa Fe desks." },
  { year: "2022", text: "Launched the agent dashboard — approval-to-live in an afternoon." },
  { year: "2026", text: "48 cities, $2.4B closed, and still no listing written by a bot." },
];

export function AboutPage() {
  return (
    <main className="pt-28">
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Kicker>Our story</Kicker>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">
              Real estate, written <em className="text-moss">like it matters.</em>
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-[1.85] text-ink/65">
              Atrium started with a simple annoyance: listing copy that reads like a spec sheet, photographed in the dark, priced by algorithm. We believed homes deserved better — a walk-through by someone who cares, honest words, daylight.
            </p>
            <p className="mt-4 max-w-lg text-[15px] leading-[1.85] text-ink/65">
              Ten years later that belief is a marketplace: every listing walked in person, every photo taken at the hour the house looks most like itself, every price backed by comps a human checked.
            </p>
            <div className="mt-8 flex gap-3.5">
              <Button variant="brass" to="/listings">Browse the collection</Button>
              <Button variant="outline" to="/contact">Work with us</Button>
            </div>
          </div>
          <Reveal className="relative">
            <div className="absolute -right-4 -top-4 hidden h-full w-full rounded-2xl border-2 border-brass/50 sm:block" aria-hidden="true" />
            <img src={IMG.townhouse} alt="A restored brick townhouse listed on Atrium" className="relative aspect-[4/3.4] w-full rounded-2xl object-cover shadow-lift" />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <SectionHead kicker="What we optimize for" title={<>Three promises, <em className="text-moss">kept</em></>} />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: <ICompass className="h-6 w-6" />, title: "Walked, not scraped", body: "If an agent hasn't stood in the kitchen, it isn't on Atrium. No duplicates, no phantom listings, no bait pricing." },
            { icon: <ILeaf className="h-6 w-6" />, title: "Honest by default", body: "Foundation cracks, HOA quirks, the noisy street — disclosed up front, in plain language, before you tour." },
            { icon: <IKey className="h-6 w-6" />, title: "Yours on your terms", body: "Tour when you like, offer when ready. Agents are salaried enough to say “this one isn't for you” and mean it." },
          ].map((v, i) => (
            <Reveal key={v.title} delay={i * 100}>
              <div className="group h-full rounded-card border border-mist bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brass/50 hover:shadow-lift">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pine text-brasssoft transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">{v.icon}</span>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">{v.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink/60">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-mist bg-mistsoft/45 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHead kicker="The people" title={<>Small team, <em className="text-moss">long memory</em></>} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div className="group h-full rounded-card border border-mist bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <Monogram name={t.name} size="lg" tone={i} />
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">{t.name}</h3>
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-brassdeep">{t.role}</p>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-ink/60">{t.note}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid gap-x-12 gap-y-8 md:grid-cols-4">
            {MILESTONES.map((m, i) => (
              <Reveal key={m.year} delay={i * 90}>
                <p className="font-display text-3xl font-semibold text-brass">{m.year}</p>
                <span className="mt-2 block h-px w-10 bg-ink/20" />
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink/65">{m.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-pine px-8 py-10 text-paper">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">Ready to find your door?</h2>
              <p className="mt-1.5 text-[14px] text-sagelight">The collection is open — no account needed to browse.</p>
            </div>
            <Button variant="brass" size="lg" to="/listings">Start browsing <IArrowR className="h-4.5 w-4.5" /></Button>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

/* --------------------------------- Contact --------------------------------- */

export function ContactPage() {
  const route = useRoute();
  const topicParam = route.query.get("topic");
  const [topic, setTopic] = useState(topicParam ?? "buying");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  React.useEffect(() => {
    if (topicParam) setTopic(topicParam);
  }, [topicParam]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Your name, please";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Valid email required";
    if (form.message.trim().length < 10) errs.message = "Tell us a little more";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    setBusy(false);
    setSent(true);
    toast("Message sent — we reply within one business day.");
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      <div className="max-w-2xl">
        <Kicker>Say hello</Kicker>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">
          Talk to a <em className="text-moss">person,</em> not a ticket.
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-ink/60">
          Buying, selling, joining as an agent or just curious — write to us and a human answers within one business day.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          {sent ? (
            <div className="anim-pop flex h-full flex-col items-center justify-center rounded-card border border-moss/30 bg-moss/8 px-8 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-moss text-paper"><IMail className="h-6 w-6" /></span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-ink">Message on its way</h2>
              <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink/60">
                Thanks, {form.name.split(" ")[0] || "friend"} — we'll reply to <strong>{form.email}</strong> within one business day.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => { setSent(false); setForm({ name: "", email: "", message: "" }); }}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-card border border-mist bg-card p-7" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" error={errors.name}>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jordan Alvarez" />
                </Field>
                <Field label="Email" error={errors.email}>
                  <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@email.com" />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Topic">
                  <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                    <option value="buying">Buying a home</option>
                    <option value="selling">Selling with Atrium</option>
                    <option value="careers">Careers</option>
                    <option value="press">Press</option>
                    <option value="other">Something else</option>
                  </Select>
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Message" error={errors.message}>
                  <Textarea rows={6} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Tell us what you're looking for — cities, timing, the feeling you're after…" />
                </Field>
              </div>
              <Button type="submit" variant="primary" size="lg" className="mt-5" disabled={busy}>
                {busy ? "Sending…" : <>Send message <IArrowR className="h-4.5 w-4.5" /></>}
              </Button>
            </form>
          )}
        </Reveal>

        <div className="space-y-5">
          {OFFICES.map((o, i) => (
            <Reveal key={o.city} delay={i * 90}>
              <div className="group rounded-card border border-mist bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/50 hover:shadow-soft">
                <h3 className="font-display text-xl font-semibold text-ink">{o.city}</h3>
                <ul className="mt-3 space-y-2 text-[13.5px] font-medium text-ink/65">
                  <li className="flex items-center gap-2.5"><IPin className="h-4 w-4 shrink-0 text-brass" /> {o.address}</li>
                  <li className="flex items-center gap-2.5"><IPhone className="h-4 w-4 shrink-0 text-brass" /> {o.phone}</li>
                  <li className="flex items-center gap-2.5"><IClock className="h-4 w-4 shrink-0 text-brass" /> {o.hours}</li>
                </ul>
              </div>
            </Reveal>
          ))}
          <Reveal delay={280}>
            <div className="rounded-card bg-pine p-6 text-paper">
              <IShield className="h-7 w-7 text-brasssoft" />
              <h3 className="mt-3 font-display text-lg font-semibold">Licensed & insured</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-sagelight">Brokered in 14 states. Equal Housing Opportunity. Your data is never sold — see our privacy page.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------------- Legal ---------------------------------- */

export function LegalPage({ slug }: { slug: string }) {
  const isPrivacy = slug !== "terms";
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8">
      <Kicker>The fine print</Kicker>
      <h1 className="font-display text-4xl font-semibold text-ink">{isPrivacy ? "Privacy Policy" : "Terms of Service"}</h1>
      <p className="mt-2 text-[13px] font-semibold text-ink/45">Last updated January 2026 · Atrium Estates LLC</p>
      <div className="prose-sm mt-8 space-y-5 text-[14.5px] leading-[1.85] text-ink/70">
        {isPrivacy ? (
          <>
            <p><strong className="text-ink">What we collect.</strong> Account details you give us (name, email, phone), homes you save, tours you book, and basic usage analytics. Nothing is bought from data brokers, and nothing is sold — ever.</p>
            <p><strong className="text-ink">How it's used.</strong> To run your account, notify you about tours and inquiries, and improve search relevance. Marketing emails only with explicit consent, one-click unsubscribe.</p>
            <p><strong className="text-ink">Your rights.</strong> Export or delete your data at any time from the dashboard or by writing to privacy@atrium.est. Deletion completes within 30 days.</p>
            <p><strong className="text-ink">Demo note.</strong> This demo build stores all data in your browser's localStorage. Clearing site data removes everything.</p>
          </>
        ) : (
          <>
            <p><strong className="text-ink">The marketplace.</strong> Atrium connects buyers, sellers and licensed agents. Listings are provided by agents and verified by our review team before publishing.</p>
            <p><strong className="text-ink">Fair use.</strong> No scraping, no fake inquiries, no impersonating agents. Accounts violating this are removed after one warning, zero warnings for fraud.</p>
            <p><strong className="text-ink">Transactions.</strong> Atrium facilitates introductions and tour scheduling; purchase agreements are executed with licensed brokers in your state.</p>
            <p><strong className="text-ink">Liability.</strong> We verify what we reasonably can, but buyers should always inspect and independently verify condition, title and zoning.</p>
          </>
        )}
      </div>
      <div className="mt-10 flex gap-3">
        <Button to="/listings" variant="primary">Back to listings</Button>
        <Button to={isPrivacy ? "/legal/terms" : "/legal/privacy"} variant="outline">{isPrivacy ? "Read the terms" : "Read the privacy policy"}</Button>
      </div>
    </main>
  );
}

/* ---------------------------------- 404 ------------------------------------ */

export function NotFoundPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-5 pb-24 pt-44 text-center">
      <p className="font-display text-[6rem] font-semibold leading-none text-brass/50">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">This address isn't on our map.</h1>
      <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-ink/55">
        The page you're after was moved, sold, or never built. The rest of the neighborhood is still here.
      </p>
      <div className="mt-8 flex gap-3">
        <Button to="/" variant="primary">Back home</Button>
        <Button to="/listings" variant="outline">Browse listings</Button>
      </div>
    </main>
  );
}
