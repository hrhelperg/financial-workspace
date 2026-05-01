import { AsyncLocalStorage } from "node:async_hooks";

type Identity = { userId: string };

const storage = new AsyncLocalStorage<Identity>();

export function setRequestIdentity(userId: string) {
  storage.enterWith({ userId });
}

export function getRequestIdentity(): string | null {
  return storage.getStore()?.userId ?? null;
}

export function runWithIdentity<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  return storage.run({ userId }, fn);
}

export const identityStorage = storage;
