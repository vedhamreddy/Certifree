"use client";
import { localStore } from "./local-store";
import type { Profile } from "./recommend";

/** Quiz answers. Kept on this device only; never uploaded or synced. */
export const profileStore = localStore<Profile | null>("certifree:quiz", null);
export const useProfile = profileStore.use;
