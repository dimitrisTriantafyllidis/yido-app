const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`API error ${status}`);
  }
}

type ProblemBody = {
  title?: string;
  detail?: string;
  errors?: string[] | Record<string, string[]>;
};

export function getApiErrorMessage(
  err: ApiError,
  fallback = "Κάτι πήγε στραβά. Δοκιμάστε ξανά."
): string {
  if (err.status === 429) {
    return "Πολλές προσπάθειες. Περιμένετε λίγο και δοκιμάστε ξανά.";
  }

  const body = err.body as ProblemBody | null;
  if (body?.title) return body.title;
  if (body?.detail) return body.detail;
  return fallback;
}

export function getApiFieldErrors(err: ApiError): string[] {
  const body = err.body as ProblemBody | null;
  if (!body?.errors) return [];

  if (Array.isArray(body.errors)) return body.errors;

  return Object.values(body.errors).flat();
}

export async function api<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
