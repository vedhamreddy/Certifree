"use client";
import { localStore } from "./local-store";

export const MAX_COMPARE = 3;
const store = localStore<string[]>("certifree:compare", []);

export function useCompare() {
  const ids = store.use();
  return {
    ids,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => {
      const cur = store.read();
      store.write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id].slice(-MAX_COMPARE));
    },
    remove: (id: string) => store.write(store.read().filter((x) => x !== id)),
    clear: () => store.write([]),
  };
}
