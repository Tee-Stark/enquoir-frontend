/**
 * Shared shape for every cursor-paginated list response in the API
 * (payments, attempts, invitations, audit log, ...): pass `next_cursor`
 * back as the `cursor` query param to fetch the next page; `null` means
 * the last page.
 */
export type CursorPage<T> = {
  next_cursor: string | null;
} & Record<string, T[] | string | null>;

/** `getNextPageParam` for TanStack Query's `useInfiniteQuery`. */
export function nextCursorParam<T>(page: CursorPage<T>): string | undefined {
  return page.next_cursor ?? undefined;
}
