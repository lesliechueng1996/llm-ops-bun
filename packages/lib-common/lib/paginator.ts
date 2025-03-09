import type { PaginatorReq } from 'lib-api-schema';

export const calculateTakeSkip = (param: PaginatorReq) => {
  const { currentPage, pageSize } = param;
  const take = pageSize;
  const skip = (currentPage - 1) * pageSize;
  return { take, skip };
};
