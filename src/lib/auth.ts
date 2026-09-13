type ApiErrorShape = {
  response?: {
    status?: number;
    data?: any;
  };
  message?: string;
};

export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  if (raw.startsWith('/login') || raw.startsWith('/register')) return null;
  return raw;
}

export function suggestUsername(fullName: string, email = ''): string {
  const fromName = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 20);
  if (fromName.length >= 3) return fromName;
  const fromEmail = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20);
  return fromEmail;
}

export function isValidIndianMobile(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (!digits) return true;
  if (digits.length === 12 && digits.startsWith('91')) return /^[6-9]\d{9}$/.test(digits.slice(2));
  if (digits.length === 11 && digits.startsWith('0')) return /^[6-9]\d{9}$/.test(digits.slice(1));
  return /^[6-9]\d{9}$/.test(digits);
}

function firstMessage(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length) return firstMessage(value[0]);
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.detail === 'string') return record.detail;
    const nested = Object.values(record)[0];
    return firstMessage(nested);
  }
  return null;
}

export function apiErrorMessage(err: ApiErrorShape, fallback: string): string {
  if (!err?.response) {
    return 'No internet connection. Check your network and try again.';
  }
  const data = err.response.data;
  const fromBody =
    firstMessage(data?.error) ||
    firstMessage(data?.detail) ||
    firstMessage(data?.non_field_errors) ||
    firstMessage(data);
  if (fromBody) return fromBody;
  if (err.response.status === 401) {
    return 'That email/username or password is not correct. Try again, or create a free account.';
  }
  return fallback;
}

export function fieldErrorsFromApi(err: ApiErrorShape): Record<string, string> {
  const data = err?.response?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'error' || key === 'detail' || key === 'non_field_errors') continue;
    const message = firstMessage(value);
    if (message) out[key] = message;
  }
  return out;
}

export function afterAuthPath(profile: any, nextPath: string | null): string {
  if (profile?.is_owner === true) return '/institute/dashboard';
  if (!profile?.preferred_exams || profile.preferred_exams.length === 0) {
    return nextPath ? `/onboarding?next=${encodeURIComponent(nextPath)}` : '/onboarding';
  }
  return nextPath || '/home';
}
