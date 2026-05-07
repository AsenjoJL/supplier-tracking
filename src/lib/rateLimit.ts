export type RateLimitOptions = {
  maxAttempts: number;
  windowMs: number;
  message?: string;
};

const storagePrefix = "hazel-agritrack-rate-limit";

export const authRateLimit: RateLimitOptions = {
  maxAttempts: 5,
  windowMs: 5 * 60 * 1000,
  message: "Too many attempts. Please wait a few minutes before trying again.",
};

export const writeRateLimit: RateLimitOptions = {
  maxAttempts: 20,
  windowMs: 60 * 1000,
  message: "You're saving too quickly. Please wait a moment before trying again.",
};

const getStorageKey = (key: string): string => `${storagePrefix}:${key}`;

const readAttempts = (key: string): number[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey(key));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  } catch {
    return [];
  }
};

const writeAttempts = (key: string, attempts: number[]): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(key), JSON.stringify(attempts));
};

export function assertRateLimit(key: string, options: RateLimitOptions): void {
  const now = Date.now();
  const activeAttempts = readAttempts(key).filter((timestamp) => now - timestamp < options.windowMs);

  if (activeAttempts.length >= options.maxAttempts) {
    const oldestAttempt = Math.min(...activeAttempts);
    const waitSeconds = Math.max(1, Math.ceil((options.windowMs - (now - oldestAttempt)) / 1000));
    throw new Error(`${options.message ?? "Too many requests. Please try again later"} Try again in ${waitSeconds}s.`);
  }

  writeAttempts(key, [...activeAttempts, now]);
}

export function withRateLimit<TInput, TResult>(
  key: string,
  mutationFn: (input: TInput) => Promise<TResult>,
  options: RateLimitOptions = writeRateLimit,
): (input: TInput) => Promise<TResult> {
  return async (input: TInput) => {
    assertRateLimit(key, options);
    return mutationFn(input);
  };
}
