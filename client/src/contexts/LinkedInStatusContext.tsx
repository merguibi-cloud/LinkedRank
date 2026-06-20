import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export type LinkedInConnectionStatus = {
  configured: boolean;
  connected: boolean;
  profileName: string | null;
  profilePicture: string | null;
  email: string | null;
  profileUrl: string | null;
  linkedinUserId: string | null;
  tokenExpiresAt: string | null;
  lastSync: string | null;
};

const defaultStatus: LinkedInConnectionStatus = {
  configured: false,
  connected: false,
  profileName: null,
  profilePicture: null,
  email: null,
  profileUrl: null,
  linkedinUserId: null,
  tokenExpiresAt: null,
  lastSync: null,
};

type LinkedInStatusContextValue = {
  status: LinkedInConnectionStatus;
  loading: boolean;
  syncing: boolean;
  refresh: () => Promise<void>;
  sync: () => Promise<boolean>;
};

const LinkedInStatusContext = createContext<LinkedInStatusContextValue | null>(
  null
);

export function LinkedInStatusProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<LinkedInConnectionStatus>(defaultStatus);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const loadedForUserId = useRef<number | null>(null);

  const fetchStatus = useCallback(async (showLoading: boolean) => {
    if (!user) {
      setStatus(defaultStatus);
      setLoading(false);
      loadedForUserId.current = null;
      return;
    }

    if (showLoading) setLoading(true);

    try {
      const response = await fetch("/api/linkedin/status", {
        credentials: "include",
      });
      if (response.ok) {
        setStatus(await response.json());
      } else {
        setStatus(defaultStatus);
      }
    } catch {
      setStatus(defaultStatus);
    } finally {
      setLoading(false);
      loadedForUserId.current = user.id;
    }
  }, [user]);

  const refresh = useCallback(async () => {
    await fetchStatus(false);
  }, [fetchStatus]);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/linkedin/sync", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setStatus((prev) => ({ ...prev, ...data }));
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStatus(defaultStatus);
      setLoading(false);
      loadedForUserId.current = null;
      return;
    }

    const isFirstLoad = loadedForUserId.current !== user.id;
    void fetchStatus(isFirstLoad);
  }, [authLoading, user?.id, fetchStatus]);

  useEffect(() => {
    const onStatusChanged = () => {
      void refresh();
    };
    window.addEventListener("linkedin-status-changed", onStatusChanged);
    return () =>
      window.removeEventListener("linkedin-status-changed", onStatusChanged);
  }, [refresh]);

  return (
    <LinkedInStatusContext.Provider
      value={{
        status,
        loading: loading || authLoading,
        syncing,
        refresh,
        sync,
      }}
    >
      {children}
    </LinkedInStatusContext.Provider>
  );
}

export function useLinkedInStatus() {
  const ctx = useContext(LinkedInStatusContext);
  if (!ctx) {
    throw new Error(
      "useLinkedInStatus must be used within LinkedInStatusProvider"
    );
  }
  return ctx;
}
