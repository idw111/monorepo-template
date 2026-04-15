import dayjs, { ManipulateType } from 'dayjs';

export const SECOND = 1000;

export const MINUTE = SECOND * 60;

export const HOUR = MINUTE * 60;

export const DAY = HOUR * 24;

export const WEEK = DAY * 7;

export const YEAR = DAY * 365;

export const getSeconds = (time: string): number => {
  if (/^\d+s$/i.test(time)) return Math.floor(Number(time.replace(/s$/i, '').trim()));
  if (/^\d+m$/i.test(time)) return Math.floor(Number(time.replace(/m$/i, '').trim()) * 60);
  if (/^\d+h$/i.test(time)) return Math.floor(Number(time.replace(/h$/i, '').trim()) * 60 * 60);
  if (/^\d+d$/i.test(time)) return Math.floor(Number(time.replace(/d$/i, '').trim()) * 60 * 60 * 24);
  return 0;
};

export const getDatesBetween = (
  startDate: Date | string | number = Date.now(),
  endDate: Date | string | number = Date.now(),
  unit: ManipulateType = 'day'
): string[] => {
  if (dayjs(startDate).isAfter(endDate)) return getDatesBetween(endDate, startDate, unit);
  const diff = dayjs(endDate).diff(startDate, unit);
  return new Array(diff + 1).fill(0).map((_, i) => dayjs(startDate).add(i, unit).format('YYYY-MM-DD'));
};
