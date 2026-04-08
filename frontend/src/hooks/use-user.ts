import { useEffect, useState } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

type UserState = {
  loading: boolean;
  error: AuthError | null;
  session: Session | null;
  user: User | null;
  role: string | null;
};

const supabase = createClient();

let currentState: UserState = {
  loading: true,
  error: null,
  session: null,
  user: null,
  role: null,
};

let hasHydrated = false;
let activeRequest: Promise<void> | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;
const listeners = new Set<(nextState: UserState) => void>();

const publish = (partialState: Partial<UserState>) => {
  currentState = { ...currentState, ...partialState };
  listeners.forEach((listener) => listener(currentState));
};

const toRole = (session: Session | null) =>
  (session?.user?.app_metadata?.role as string | undefined) ?? null;

const AUTH_TIMEOUT_MS = 8000;

const hydrateUser = async () => {
  if (activeRequest) return activeRequest;

  activeRequest = (async () => {
    const timeoutId = setTimeout(() => {
      hasHydrated = true;
      publish({
        loading: false,
        error: null,
        session: null,
        user: null,
        role: null,
      });
    }, AUTH_TIMEOUT_MS);

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      clearTimeout(timeoutId);

      if (error) {
        publish({
          loading: false,
          error,
          session: null,
          user: null,
          role: null,
        });
      } else {
        publish({
          loading: false,
          error: null,
          session: session ?? null,
          user: session?.user ?? null,
          role: toRole(session ?? null),
        });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      publish({
        loading: false,
        error: error as AuthError,
      });
    } finally {
      hasHydrated = true;
      activeRequest = null;
    }
  })();

  return activeRequest;
};

const ensureAuthSubscription = () => {
  if (authSubscription) return;

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    hasHydrated = true;
    publish({
      loading: false,
      error: null,
      session: session ?? null,
      user: session?.user ?? null,
      role: toRole(session ?? null),
    });
  });

  authSubscription = subscription;
};

export function useUser() {
  const [state, setState] = useState<UserState>(currentState);

  useEffect(() => {
    listeners.add(setState);
    setState(currentState);

    ensureAuthSubscription();
    if (!hasHydrated && !activeRequest) {
      void hydrateUser();
    }

    return () => {
      listeners.delete(setState);
      if (listeners.size === 0 && authSubscription) {
        authSubscription.unsubscribe();
        authSubscription = null;
      }
    };
  }, []);

  return state;
}
