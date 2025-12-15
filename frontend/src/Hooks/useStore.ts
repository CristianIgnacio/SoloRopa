import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../Types/Types";

type UserState = {
    user : User | null,
    isAuthenticated : boolean,
    login : (userData : User) => void,
    logout : () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) =>
        set({
          user: userData,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "user-storage",
    }
  )
);