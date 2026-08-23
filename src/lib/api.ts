/**
 * In-browser API layer.
 *
 * Mirrors the REST surface of the Express + PostgreSQL backend
 * (POST /api/auth/login, GET /api/properties?filters, POST /api/bookings, …)
 * with simulated network latency, validation and role checks, persisting to
 * localStorage so every demo session survives reloads.
 */
import { SEED_BOOKINGS, SEED_INQUIRIES, SEED_PROPERTIES, SEED_REVIEWS, SEED_USERS } from "./data";
import { uid } from "./format";
import type {
  Booking, BookingStatus, Filters, Inquiry, ListingStatus, Property, PropertyInput, Role, User,
} from "./types";

const DB_KEY = "atrium_db_v3";
const SESSION_KEY = "atrium_session_v3";
const GUEST_FAVS_KEY = "atrium_guest_favs_v3";

interface DB {
  users: User[];
  properties: Property[];
  inquiries: Inquiry[];
  bookings: Booking[];
  reviews: import("./types").Review[];
  favorites: Record<string, string[]>;
}

let cache: DB | null = null;

/* storage helpers — tolerate locked-down sandboxed iframes */
function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — keep in-memory only */
  }
}
function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

function seedDB(): DB {
  return {
    users: SEED_USERS.map((u) => ({ ...u })),
    properties: SEED_PROPERTIES.map((p) => ({ ...p })),
    inquiries: SEED_INQUIRIES.map((i) => ({ ...i })),
    bookings: SEED_BOOKINGS.map((b) => ({ ...b })),
    reviews: SEED_REVIEWS.map((r) => ({ ...r })),
    favorites: { "u-buyer": ["p-01", "p-05", "p-09"], "u-buyer2": ["p-02", "p-05"] },
  };
}

function loadDB(): DB {
  if (cache) return cache;
  try {
    const raw = safeGet(DB_KEY);
    if (raw) {
      cache = JSON.parse(raw) as DB;
      return cache;
    }
  } catch {
    /* corrupted storage — reseed */
  }
  cache = seedDB();
  saveDB();
  return cache;
}

function saveDB(): void {
  if (cache) safeSet(DB_KEY, JSON.stringify(cache));
}

const wait = () => new Promise<void>((r) => setTimeout(r, 320 + Math.random() * 380));

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function requireSession(): User {
  const s = getSession();
  if (!s) throw new ApiError(401, "You must be signed in to do that.");
  return s;
}

function requireRole(...roles: Role[]): User {
  const s = requireSession();
  if (!roles.includes(s.role)) throw new ApiError(403, "Your account doesn't have permission for that.");
  return s;
}

/* ---------------------------------- auth ---------------------------------- */

export interface Session {
  userId: string;
  token: string;
  issuedAt: string;
}

export function getSession(): User | null {
  try {
    const raw = safeGet(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    const user = loadDB().users.find((u) => u.id === s.userId);
    return user ?? null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<User> {
  await wait();
  const db = loadDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) throw new ApiError(401, "Email or password is incorrect.");
  const token = btoa(JSON.stringify({ sub: user.id, role: user.role, exp: Date.now() + 86_400_000 }));
  safeSet(SESSION_KEY, JSON.stringify({ userId: user.id, token, issuedAt: new Date().toISOString() }));
  return user;
}

export async function register(input: { name: string; email: string; password: string; role: Role }): Promise<User> {
  await wait();
  const db = loadDB();
  if (input.name.trim().length < 2) throw new ApiError(422, "Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new ApiError(422, "That email address doesn't look right.");
  if (input.password.length < 8) throw new ApiError(422, "Password must be at least 8 characters.");
  if (db.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase()))
    throw new ApiError(409, "An account with that email already exists.");
  const user: User = {
    id: uid("u"),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    role: input.role,
    phone: "",
    joinedOn: new Date().toISOString().slice(0, 10),
  };
  db.users.push(user);
  saveDB();
  safeSet(
    SESSION_KEY,
    JSON.stringify({ userId: user.id, token: btoa(JSON.stringify({ sub: user.id, role: user.role })), issuedAt: new Date().toISOString() })
  );
  return user;
}

export async function logout(): Promise<void> {
  safeRemove(SESSION_KEY);
}

export async function updateProfile(userId: string, patch: { name: string; phone: string }): Promise<User> {
  await wait();
  const db = loadDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new ApiError(404, "User not found.");
  user.name = patch.name.trim() || user.name;
  user.phone = patch.phone;
  saveDB();
  return user;
}

/* ------------------------------- properties ------------------------------- */

const DEFAULT_FILTERS: Filters = {
  q: "", city: "any", type: "any", min: 0, max: 10_000_000, beds: 0, baths: 0, status: "any", sort: "newest",
};

export interface PagedProperties {
  items: Property[];
  total: number;
  hasMore: boolean;
}

export async function listProperties(f: Partial<Filters>, page = 1, perPage = 6): Promise<PagedProperties> {
  await wait();
  const db = loadDB();
  const fl = { ...DEFAULT_FILTERS, ...f };
  let items = db.properties.filter((p) => p.status !== "pending" && p.status !== "rejected");
  if (fl.status !== "any") items = items.filter((p) => p.status === fl.status);
  if (fl.city !== "any") items = items.filter((p) => p.city === fl.city);
  if (fl.type !== "any") items = items.filter((p) => p.type === fl.type);
  items = items.filter((p) => p.price >= fl.min && p.price <= fl.max);
  if (fl.beds > 0) items = items.filter((p) => p.beds >= fl.beds);
  if (fl.baths > 0) items = items.filter((p) => p.baths >= fl.baths);
  if (fl.q.trim()) {
    const q = fl.q.trim().toLowerCase();
    items = items.filter((p) =>
      [p.title, p.city, p.district, p.address, p.state].join(" ").toLowerCase().includes(q)
    );
  }
  switch (fl.sort) {
    case "price-asc": items.sort((a, b) => a.price - b.price); break;
    case "price-desc": items.sort((a, b) => b.price - a.price); break;
    case "area-desc": items.sort((a, b) => b.area - a.area); break;
    default: items.sort((a, b) => +new Date(b.listedOn) - +new Date(a.listedOn));
  }
  const end = page * perPage;
  return { items: items.slice(0, end), total: items.length, hasMore: end < items.length };
}

export async function getProperty(id: string): Promise<{ property: Property; agent: User | null }> {
  await wait();
  const db = loadDB();
  const property = db.properties.find((p) => p.id === id);
  if (!property) throw new ApiError(404, "We couldn't find that listing.");
  property.views += 1;
  saveDB();
  return { property, agent: db.users.find((u) => u.id === property.agentId) ?? null };
}

export async function getFeatured(n: number): Promise<Property[]> {
  await wait();
  const db = loadDB();
  return db.properties
    .filter((p) => p.featured && p.status === "available")
    .sort((a, b) => +new Date(b.listedOn) - +new Date(a.listedOn))
    .slice(0, n);
}

export async function getTypeCounts(): Promise<Record<string, number>> {
  await wait();
  const db = loadDB();
  const out: Record<string, number> = {};
  for (const p of db.properties) {
    if (p.status === "pending" || p.status === "rejected") continue;
    out[p.type] = (out[p.type] ?? 0) + 1;
  }
  return out;
}

export async function getCities(): Promise<string[]> {
  const db = loadDB();
  return [...new Set(db.properties.filter((p) => p.status !== "rejected").map((p) => p.city))].sort();
}

export async function getSimilar(id: string, n = 3): Promise<Property[]> {
  await wait();
  const db = loadDB();
  const current = db.properties.find((p) => p.id === id);
  if (!current) return [];
  return db.properties
    .filter((p) => p.id !== id && p.status === "available")
    .map((p) => ({ p, score: (p.type === current.type ? 2 : 0) + (p.city === current.city ? 2 : 0) + (p.state === current.state ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || +new Date(b.p.listedOn) - +new Date(a.p.listedOn))
    .slice(0, n)
    .map((x) => x.p);
}

export async function createProperty(input: PropertyInput): Promise<Property> {
  await wait();
  const user = requireRole("AGENT", "ADMIN");
  if (!input.title.trim() || input.price <= 0 || !input.address.trim() || !input.city.trim())
    throw new ApiError(422, "Title, price, address and city are required.");
  const db = loadDB();
  const property: Property = {
    id: uid("p"),
    title: input.title.trim(),
    description: input.description.trim() || "Description coming soon — fresh off the drafting table.",
    price: input.price,
    type: input.type,
    status: user.role === "ADMIN" ? "available" : "pending",
    beds: input.beds, baths: input.baths, area: input.area,
    address: input.address.trim(), city: input.city.trim(), state: input.state.trim() || "—",
    district: input.district.trim() || "—",
    lat: 35 + Math.random() * 10, lng: -105 + Math.random() * 20,
    mapX: 15 + Math.random() * 70, mapY: 15 + Math.random() * 65,
    images: input.images.length ? input.images : [input.images[0]],
    amenities: input.amenities,
    agentId: user.id,
    yearBuilt: input.yearBuilt || new Date().getFullYear(),
    listedOn: new Date().toISOString().slice(0, 10),
    views: 0,
  };
  db.properties.unshift(property);
  saveDB();
  return property;
}

export async function updateProperty(id: string, patch: Partial<PropertyInput> & { status?: ListingStatus }): Promise<Property> {
  await wait();
  const user = requireRole("AGENT", "ADMIN");
  const db = loadDB();
  const p = db.properties.find((x) => x.id === id);
  if (!p) throw new ApiError(404, "Listing not found.");
  if (user.role !== "ADMIN" && p.agentId !== user.id) throw new ApiError(403, "Not your listing.");
  Object.assign(p, patch);
  saveDB();
  return p;
}

export async function deleteProperty(id: string): Promise<void> {
  await wait();
  const user = requireRole("AGENT", "ADMIN");
  const db = loadDB();
  const p = db.properties.find((x) => x.id === id);
  if (!p) throw new ApiError(404, "Listing not found.");
  if (user.role !== "ADMIN" && p.agentId !== user.id) throw new ApiError(403, "Not your listing.");
  db.properties = db.properties.filter((x) => x.id !== id);
  db.inquiries = db.inquiries.filter((i) => i.propertyId !== id);
  db.bookings = db.bookings.filter((b) => b.propertyId !== id);
  db.reviews = db.reviews.filter((r) => r.propertyId !== id);
  for (const k of Object.keys(db.favorites)) db.favorites[k] = db.favorites[k].filter((f) => f !== id);
  saveDB();
}

export async function setPropertyStatus(id: string, status: ListingStatus): Promise<Property> {
  await wait();
  requireRole("ADMIN", "AGENT");
  const db = loadDB();
  const p = db.properties.find((x) => x.id === id);
  if (!p) throw new ApiError(404, "Listing not found.");
  p.status = status;
  saveDB();
  return p;
}

export async function listPending(): Promise<{ property: Property; agent: User | null }[]> {
  await wait();
  const db = loadDB();
  return db.properties
    .filter((p) => p.status === "pending")
    .map((p) => ({ property: p, agent: db.users.find((u) => u.id === p.agentId) ?? null }));
}

export async function listAgentProperties(agentId: string): Promise<Property[]> {
  await wait();
  const db = loadDB();
  return db.properties.filter((p) => p.agentId === agentId);
}

export async function listAllProperties(): Promise<Property[]> {
  await wait();
  const db = loadDB();
  return [...db.properties];
}

/* -------------------------------- favorites ------------------------------- */

export function getFavoriteIds(userId: string | null): string[] {
  if (!userId) {
    try {
      return JSON.parse(safeGet(GUEST_FAVS_KEY) ?? "[]") as string[];
    } catch {
      return [];
    }
  }
  return loadDB().favorites[userId] ?? [];
}

export async function toggleFavorite(userId: string | null, propertyId: string): Promise<string[]> {
  await new Promise<void>((r) => setTimeout(r, 150));
  if (!userId) {
    const current = getFavoriteIds(null);
    const next = current.includes(propertyId) ? current.filter((x) => x !== propertyId) : [...current, propertyId];
    safeSet(GUEST_FAVS_KEY, JSON.stringify(next));
    return next;
  }
  const db = loadDB();
  const list = db.favorites[userId] ?? [];
  db.favorites[userId] = list.includes(propertyId) ? list.filter((x) => x !== propertyId) : [...list, propertyId];
  saveDB();
  return db.favorites[userId];
}

export async function getSavedProperties(userId: string): Promise<Property[]> {
  await wait();
  const db = loadDB();
  const ids = db.favorites[userId] ?? [];
  return db.properties.filter((p) => ids.includes(p.id));
}

/* -------------------------------- inquiries ------------------------------- */

export async function addInquiry(input: { propertyId: string; name: string; email: string; message: string }): Promise<Inquiry> {
  await wait();
  if (input.message.trim().length < 10) throw new ApiError(422, "Message should be at least 10 characters.");
  const session = getSession();
  const db = loadDB();
  const inquiry: Inquiry = {
    id: uid("i"),
    propertyId: input.propertyId,
    userId: session?.id,
    name: session?.name ?? input.name.trim(),
    email: session?.email ?? input.email.trim(),
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
  };
  db.inquiries.unshift(inquiry);
  saveDB();
  return inquiry;
}

export async function listInquiries(opts: { agentId?: string; userId?: string } = {}): Promise<{ inquiry: Inquiry; property: Property | null }[]> {
  await wait();
  const db = loadDB();
  let items = db.inquiries;
  if (opts.userId) items = items.filter((i) => i.userId === opts.userId || i.email === getSession()?.email);
  if (opts.agentId) {
    const mine = new Set(db.properties.filter((p) => p.agentId === opts.agentId).map((p) => p.id));
    items = items.filter((i) => mine.has(i.propertyId));
  }
  return items.map((i) => ({ inquiry: i, property: db.properties.find((p) => p.id === i.propertyId) ?? null }));
}

/* --------------------------------- bookings -------------------------------- */

export async function addBooking(input: { propertyId: string; name: string; email: string; date: string; time: string }): Promise<Booking> {
  await wait();
  if (!input.date) throw new ApiError(422, "Pick a date for your visit.");
  const session = getSession();
  const db = loadDB();
  const booking: Booking = {
    id: uid("b"),
    propertyId: input.propertyId,
    userId: session?.id,
    name: session?.name ?? input.name.trim(),
    email: session?.email ?? input.email.trim(),
    date: input.date,
    time: input.time,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  db.bookings.unshift(booking);
  saveDB();
  return booking;
}

export async function listBookings(opts: { agentId?: string; userId?: string } = {}): Promise<{ booking: Booking; property: Property | null }[]> {
  await wait();
  const db = loadDB();
  let items = db.bookings;
  if (opts.userId) items = items.filter((b) => b.userId === opts.userId || b.email === getSession()?.email);
  if (opts.agentId) {
    const mine = new Set(db.properties.filter((p) => p.agentId === opts.agentId).map((p) => p.id));
    items = items.filter((b) => mine.has(b.propertyId));
  }
  return items.map((b) => ({ booking: b, property: db.properties.find((p) => p.id === b.propertyId) ?? null }));
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  await wait();
  requireSession();
  const db = loadDB();
  const b = db.bookings.find((x) => x.id === id);
  if (!b) throw new ApiError(404, "Booking not found.");
  b.status = status;
  saveDB();
  return b;
}

/* ---------------------------------- reviews -------------------------------- */

export async function listReviews(propertyId: string): Promise<{ reviews: import("./types").Review[]; average: number }> {
  await wait();
  const db = loadDB();
  const reviews = db.reviews.filter((r) => r.propertyId === propertyId);
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  return { reviews, average };
}

/* ----------------------------------- admin --------------------------------- */

export async function listUsers(): Promise<(User & { listings: number })[]> {
  await wait();
  requireRole("ADMIN");
  const db = loadDB();
  return db.users.map((u) => ({ ...u, listings: db.properties.filter((p) => p.agentId === u.id).length }));
}

export async function setUserRole(userId: string, role: Role): Promise<void> {
  await wait();
  requireRole("ADMIN");
  const db = loadDB();
  const u = db.users.find((x) => x.id === userId);
  if (!u) throw new ApiError(404, "User not found.");
  u.role = role;
  saveDB();
}

export async function removeUser(userId: string): Promise<void> {
  await wait();
  const me = requireRole("ADMIN");
  if (me.id === userId) throw new ApiError(422, "You can't remove your own account.");
  const db = loadDB();
  db.users = db.users.filter((x) => x.id !== userId);
  saveDB();
}

export async function platformStats(): Promise<{
  listings: number; pending: number; users: number; inquiries: number; bookings: number; views: number; volume: number;
}> {
  await wait();
  const db = loadDB();
  const active = db.properties.filter((p) => p.status === "available");
  return {
    listings: db.properties.length,
    pending: db.properties.filter((p) => p.status === "pending").length,
    users: db.users.length,
    inquiries: db.inquiries.length,
    bookings: db.bookings.length,
    views: db.properties.reduce((s, p) => s + p.views, 0),
    volume: active.reduce((s, p) => s + p.price, 0),
  };
}

export async function agentStats(agentId: string): Promise<{
  listings: number; views: number; inquiries: number; bookings: number; series: number[];
}> {
  await wait();
  const db = loadDB();
  const mine = db.properties.filter((p) => p.agentId === agentId);
  const ids = new Set(mine.map((p) => p.id));
  const views = mine.reduce((s, p) => s + p.views, 0);
  const base = Math.max(60, Math.round(views / 10));
  const series = [0.42, 0.55, 0.48, 0.66, 0.74, 0.7, 0.86, 1].map((f, i) => Math.round(base * f) + i * 3);
  return {
    listings: mine.length,
    views,
    inquiries: db.inquiries.filter((i) => ids.has(i.propertyId)).length,
    bookings: db.bookings.filter((b) => ids.has(b.propertyId)).length,
    series,
  };
}

export function resetDemoData(): void {
  safeRemove(DB_KEY);
  cache = null;
  loadDB();
}
