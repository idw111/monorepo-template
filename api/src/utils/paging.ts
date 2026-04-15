interface PagingQuery {
  page?: number | string;
  pageSize?: number | string;
}

export const getPaging = (query: PagingQuery, defaultPageSize = 10): PagingQuery & { offset: number; limit: number } => {
  const page = Math.floor(Number(query?.page) || 1);
  const pageSize = Math.min(Math.floor(Number(query.pageSize) || defaultPageSize), 100);
  const offset = (page - 1) * pageSize;
  const limit = pageSize;
  return { page, pageSize, offset, limit };
};
