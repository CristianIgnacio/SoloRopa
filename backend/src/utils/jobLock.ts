import { randomUUID } from "node:crypto";
import JobLock from "../models/JobLock";

export class JobLockedError extends Error {
  constructor(public readonly key: string) {
    super(`Ya hay un trabajo "${key}" en curso`);
    this.name = "JobLockedError";
  }
}

const DUPLICATE_KEY = 11000;

/**
 * Intenta tomar el bloqueo `key` por `ttlMs`. Devuelve el owner si lo tomó, o null si otro
 * proceso lo tiene y aún no vence. Si el bloqueo existe pero venció, se lo queda.
 */
export async function acquireJobLock(key: string, ttlMs: number): Promise<string | null> {
  const owner = randomUUID();
  const now = new Date();

  try {
    // Si existe y no ha vencido, el filtro no calza y el upsert choca con el _id existente.
    await JobLock.updateOne(
      { _id: key, expiresAt: { $lte: now } },
      { $set: { owner, lockedAt: now, expiresAt: new Date(now.getTime() + ttlMs) } },
      { upsert: true }
    );
    return owner;
  } catch (err: any) {
    if (err?.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

/** Libera el bloqueo solo si sigue siendo nuestro (no pisa a quien lo tomó tras vencer). */
export async function releaseJobLock(key: string, owner: string): Promise<void> {
  await JobLock.deleteOne({ _id: key, owner });
}

/** Ejecuta `fn` con el bloqueo tomado. Lanza JobLockedError si ya está en curso. */
export async function withJobLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const owner = await acquireJobLock(key, ttlMs);
  if (!owner) throw new JobLockedError(key);

  try {
    return await fn();
  } finally {
    await releaseJobLock(key, owner);
  }
}
