import { create } from "zustand"

import type { UserRead } from "@/features/auth/services/types"

export type AuthStatus = "idle" | "loading" | "authenticated" | "anonymous"

type AuthState = {
  user: UserRead | null
  status: AuthStatus
  setSession: (user: UserRead | null) => void
  setStatus: (status: AuthStatus) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  setSession: (user) =>
    set({
      user,
      status: user ? "authenticated" : "anonymous",
    }),
  setStatus: (status) => set({ status }),
  reset: () => set({ user: null, status: "anonymous" }),
}))
