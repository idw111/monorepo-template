function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const publicEnv = {
  apiBaseUrl: rawApiBaseUrl ? trimTrailingSlash(rawApiBaseUrl) : null,
};
