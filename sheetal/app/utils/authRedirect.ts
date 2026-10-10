"use client";

const REDIRECT_KEY = "redirect";
const REDIRECT_STATE_KEY = "redirect_state";

interface RouterLike {
  push: (href: string) => void;
}

export interface RedirectPageState {
  modals?: Record<string, boolean>;
  [key: string]: unknown;
}

const normalizeRedirectTarget = (target: string) => {
  if (!target || target.startsWith("/login")) {
    return "/";
  }

  return target.startsWith("/") ? target : "/";
};

export const getCurrentPathWithSearch = () => {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
};

export const storeRedirectTarget = (target?: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const fallback = getCurrentPathWithSearch();
  sessionStorage.setItem(
    REDIRECT_KEY,
    normalizeRedirectTarget(target || fallback),
  );
};

export const storeRedirectState = (state?: RedirectPageState) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!state || Object.keys(state).length === 0) {
    sessionStorage.removeItem(REDIRECT_STATE_KEY);
    return;
  }

  sessionStorage.setItem(REDIRECT_STATE_KEY, JSON.stringify(state));
};

const readRedirectState = (): RedirectPageState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawState = sessionStorage.getItem(REDIRECT_STATE_KEY);
  if (!rawState) {
    return null;
  }

  try {
    return JSON.parse(rawState) as RedirectPageState;
  } catch {
    return null;
  }
};

export const peekRedirectState = (): RedirectPageState | null => readRedirectState();

const writeRedirectState = (state: RedirectPageState | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!state || Object.keys(state).length === 0) {
    sessionStorage.removeItem(REDIRECT_STATE_KEY);
    return;
  }

  sessionStorage.setItem(REDIRECT_STATE_KEY, JSON.stringify(state));
};

export const redirectToLogin = (
  router: RouterLike,
  target?: string,
  state?: RedirectPageState,
) => {
  storeRedirectTarget(target);
  storeRedirectState(state);
  router.push("/login");
};

export const consumeRedirectTarget = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const target = sessionStorage.getItem(REDIRECT_KEY);
  if (!target) {
    return null;
  }

  sessionStorage.removeItem(REDIRECT_KEY);
  return normalizeRedirectTarget(target);
};

export const consumeRedirectState = (): RedirectPageState | null => {
  const state = readRedirectState();
  if (!state) {
    return null;
  }

  sessionStorage.removeItem(REDIRECT_STATE_KEY);

  return state;
};

export const peekRedirectField = <T,>(field: string): T | null => {
  const state = readRedirectState();
  if (!state || !(field in state)) {
    return null;
  }

  return state[field] as T;
};

export const peekRedirectModalState = (modalKey: string): boolean => {
  const state = readRedirectState();
  const modals = state?.modals;
  if (!state || !modals || !(modalKey in modals)) {
    return false;
  }

  return Boolean(modals[modalKey]);
};

export const consumeRedirectField = <T,>(field: string): T | null => {
  const state = readRedirectState();
  if (!state || !(field in state)) {
    return null;
  }

  const value = state[field] as T;
  delete state[field];
  writeRedirectState(state);
  return value;
};

export const consumeRedirectModalState = (modalKey: string): boolean => {
  const state = readRedirectState();
  const modals = state?.modals;
  if (!state || !modals || !(modalKey in modals)) {
    return false;
  }

  const value = Boolean(modals[modalKey]);
  delete modals[modalKey];
  if (Object.keys(modals).length === 0) {
    delete state.modals;
  }
  writeRedirectState(state);
  return value;
};

export const syncRedirectFromQuery = (redirect: string | null) => {
  if (typeof window === "undefined" || !redirect) {
    return;
  }

  storeRedirectTarget(redirect);
};
