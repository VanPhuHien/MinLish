import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  profile?: unknown;
  [key: string]: unknown;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (accessToken: string, user: AuthUser | null) => void;
  logout: () => void;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => set({ accessToken, user }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default useAuthStore;
