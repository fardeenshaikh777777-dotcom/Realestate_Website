import { useCallback, useSyncExternalStore } from "react";
import * as api from "./api";
import type { User } from "./types";

/* ------------------------------ session store ------------------------------ */

type Listener = () => void;
const authListeners = new Set<Listener>();
let authVersion = 0;

export function emitAuth(): void {
  authVersion++;
  authListeners.forEach((l) => l());
  emitFavorites(); // favorite scope depends on session
}

function subscribeAuth(cb: Listener): () => void {
  authListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    authListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

let userSnapshotVersion = -1;
let userSnapshot: User | null = null;
function getUserSnapshot(): User | null {
  if (userSnapshotVersion !== authVersion) {
    userSnapshotVersion = authVersion;
    userSnapshot = api.getSession();
  }
  return userSnapshot;
}

export function useSession(): User | null {
  return useSyncExternalStore(subscribeAuth, getUserSnapshot);
}

/* -------------------------------- toasts ---------------------------------- */

export type ToastKind = "success" | "error" | "info";
export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const toastListeners = new Set<Listener>();
let toasts: Toast[] = [];
let toastSeq = 1;

export function toast(message: string, kind: ToastKind = "success"): void {
  const t: Toast = { id: toastSeq++, kind, message };
  toasts = [...toasts, t].slice(-4);
  toastListeners.forEach((l) => l());
  window.setTimeout(() => dismissToast(t.id), 4200);
}

export function dismissToast(id: number): void {
  toasts = toasts.filter((t) => t.id !== id);
  toastListeners.forEach((l) => l());
}

function subscribeToasts(cb: Listener): () => void {
  toastListeners.add(cb);
  return () => toastListeners.delete(cb);
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribeToasts, () => toasts);
}

/* -------------------------------- favorites -------------------------------- */

const favListeners = new Set<Listener>();
let favVersion = 0;

export function emitFavorites(): void {
  favVersion++;
  favListeners.forEach((l) => l());
}

function subscribeFavs(cb: Listener): () => void {
  favListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    favListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const favSnapshot: { v: number; ids: string[] } = { v: -1, ids: [] };
function getFavSnapshot(): string[] {
  const session = api.getSession();
  const key = favVersion * 1000 + (session ? 1 : 0);
  if (favSnapshot.v !== key) {
    favSnapshot.v = key;
    favSnapshot.ids = api.getFavoriteIds(session?.id ?? null);
  }
  return favSnapshot.ids;
}

export function useFavorites(): string[] {
  return useSyncExternalStore(subscribeFavs, getFavSnapshot);
}

export function useToggleFavorite(): (propertyId: string) => Promise<void> {
  const session = useSession();
  return useCallback(
    async (propertyId: string) => {
      await api.toggleFavorite(session?.id ?? null, propertyId);
      emitFavorites();
    },
    [session?.id]
  );
}
