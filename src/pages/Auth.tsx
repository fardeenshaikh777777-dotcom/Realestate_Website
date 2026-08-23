import React, { useState } from "react";
import { navigate, useRoute } from "../router";
import * as api from "../lib/api";
import { cx } from "../lib/format";
import { DEMO_ACCOUNTS } from "../lib/data";
import { emitAuth, toast } from "../lib/store";
import type { Role } from "../lib/types";
import { Button, Field, Input, Select } from "../components/ui";
import { IArrowR, ICheck, IKey, LogoMark } from "../components/icons";

type Mode = "login" | "register" | "forgot";

export function AuthPage() {
  const route = useRoute();
  const initialMode = (route.query.get("mode") as Mode) || "login";
  const [mode, setMode] = useState<Mode>(["login", "register", "forgot"].includes(initialMode) ? initialMode : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(route.query.get("role") === "agent" ? "AGENT" : "BUYER");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
    setForgotSent(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode === "register" && name.trim().length < 2) errs.name = "Your full name, please";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (mode !== "forgot" && password.length < 8) errs.password = "At least 8 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      if (mode === "forgot") {
        await new Promise((r) => setTimeout(r, 700));
        setForgotSent(true);
        toast("If that email exists, a reset link is on its way.");
        return;
      }
      const user = mode === "login" ? await api.login(email, password) : await api.register({ name, email, password, role });
      emitAuth();
      toast(`Welcome${mode === "register" ? " to Atrium" : " back"}, ${user.name.split(" ")[0]}.`);
      navigate(user.role === "ADMIN" ? "/admin" : user.role === "AGENT" ? "/agent" : "/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrors({ form: msg });
      toast(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1fr_1.15fr]">
      {/* brand panel */}
      <aside className="relative hidden overflow-hidden bg-pinedeep p-12 text-paper lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[28px] border-pine/70" />
          <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full border-[22px] border-pine/50" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(244,242,236,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(244,242,236,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>
        <div className="relative flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <span className="leading-none">
            <span className="block font-display text-xl font-semibold tracking-[0.14em]">ATRIUM</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.34em] text-brass">Estates</span>
          </span>
        </div>
        <div className="relative">
          <p className="font-display text-4xl font-medium leading-[1.15]">
            “The best homes go to the people who show up. <em className="text-brasssoft">Sign in and show up.</em>”
          </p>
          <ul className="mt-8 space-y-3 text-[13.5px] font-semibold text-sagelight">
            {["Save homes across every device", "Book tours in thirty seconds", "Agent & admin dashboards included"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brass text-pinedeep"><ICheck className="h-3.5 w-3.5" strokeWidth={2.4} /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-[12px] text-sagelight/60">Trusted by 40,000+ members · est. 2016</p>
      </aside>

      {/* form panel */}
      <div className="flex items-center justify-center px-5 py-16 sm:px-10 lg:pt-32">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brass">
              <IKey className="h-4 w-4" /> Member access
            </p>
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {mode === "login" ? "Welcome back" : mode === "register" ? "Join Atrium" : "Reset your key"}
            </h1>
            <p className="mt-2 text-[14px] text-ink/55">
              {mode === "login" && "Sign in to your saved homes, tours and dashboard."}
              {mode === "register" && "One account for searching, touring — or listing."}
              {mode === "forgot" && "We'll email you a link to choose a new password."}
            </p>
          </div>

          {/* tabs */}
          {mode !== "forgot" && (
            <div className="mb-6 flex rounded-full border border-mist bg-mistsoft/60 p-1">
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={cx(
                    "flex-1 rounded-full py-2.5 text-[13px] font-bold transition-all",
                    mode === m ? "bg-pine text-paper shadow-soft" : "text-ink/55 hover:text-ink"
                  )}
                >
                  {m === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
          )}

          {errors.form && (
            <p className="anim-pop mb-4 rounded-xl border border-clay/30 bg-clay/10 px-4 py-3 text-[13px] font-semibold text-clay">{errors.form}</p>
          )}

          {mode === "forgot" && forgotSent ? (
            <div className="anim-pop rounded-card border border-moss/30 bg-moss/8 p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss text-paper"><ICheck className="h-6 w-6" /></span>
              <h2 className="mt-3 font-display text-xl font-semibold text-ink">Check your inbox</h2>
              <p className="mt-1.5 text-[13.5px] text-ink/60">If <strong>{email}</strong> is registered, a reset link is on its way.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => switchMode("login")}>Back to sign in</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              {mode === "register" && (
                <>
                  <Field label="Full name" error={errors.name}>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Alvarez" autoComplete="name" />
                  </Field>
                  <Field label="I'm joining as">
                    <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                      <option value="BUYER">Buyer — searching for a home</option>
                      <option value="AGENT">Agent — listing homes</option>
                    </Select>
                  </Field>
                </>
              )}
              <Field label="Email" error={errors.email}>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
              </Field>
              <Field label="Password" error={errors.password} hint={mode !== "forgot" ? "8+ characters" : undefined}>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />
              </Field>
              {mode === "login" && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => switchMode("forgot")} className="text-[12.5px] font-bold text-brassdeep underline decoration-brass/40 underline-offset-4 transition-colors hover:text-ink">
                    Forgot password?
                  </button>
                </div>
              )}
              <Button type="submit" variant={mode === "login" ? "primary" : "brass"} size="lg" className="w-full" disabled={busy}>
                {busy ? "One moment…" : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
                {!busy && <IArrowR className="h-4.5 w-4.5" />}
              </Button>
            </form>
          )}

          {/* demo accounts */}
          {mode !== "forgot" && (
            <div className="mt-8 rounded-card border border-dashed border-brass/50 bg-brasssoft/15 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brassdeep">Demo accounts · password “demo1234”</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((d) => (
                  <button
                    key={d.role}
                    onClick={() => {
                      switchMode("login");
                      setEmail(d.email);
                      setPassword(d.password);
                      setErrors({});
                      toast(`${d.role} credentials filled — hit sign in.`, "info");
                    }}
                    className="rounded-full border border-brass/40 bg-card px-3.5 py-1.5 text-[12.5px] font-bold text-ink transition-all hover:border-brass hover:bg-brass hover:text-pinedeep"
                  >
                    {d.role} · {d.email}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
