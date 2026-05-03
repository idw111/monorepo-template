const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const API_URL = process.env.NEXT_PUBLIC_API_URL ? trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL?.trim() as string) : '';

export const envvars = {
  api: (path: string = '') => `${API_URL}${path}`,
};
