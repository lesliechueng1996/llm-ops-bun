import { HttpCode, z } from './common';

export const paginatorReqSchema = z.object({
  currentPage: z
    .number()
    .int()
    .positive()
    .lte(100)
    .optional()
    .default(1)
    .openapi({ example: 1, description: 'Current page' }),
  pageSize: z
    .number()
    .int()
    .positive()
    .lte(50)
    .optional()
    .default(20)
    .openapi({ example: 20, description: 'Page size' }),
});

export const paginatorSearchReqSchema = paginatorReqSchema.merge(
  z.object({
    searchWord: z
      .string()
      .optional()
      .openapi({ example: 'keyword1', description: 'Search word' }),
  }),
);

export type PaginatorReq = z.infer<typeof paginatorReqSchema>;

export const wrapPaginatorResSchema = <T>(item: z.ZodType<T>) => {
  return z.object({
    code: z
      .nativeEnum(HttpCode)
      .openapi({ example: HttpCode.OK, description: 'HTTP status code' }),
    message: z
      .string()
      .openapi({ example: 'ok', description: 'Response message' }),
    data: z.object({
      list: z
        .array(item)
        .openapi({ example: [], description: 'List of items' }),
      paginator: z.object({
        currentPage: z
          .number()
          .int()
          .positive()
          .openapi({ example: 1, description: 'Current page' }),
        pageSize: z
          .number()
          .int()
          .positive()
          .openapi({ example: 20, description: 'Page size' }),
        totalPage: z
          .number()
          .int()
          .positive()
          .openapi({ example: 3, description: 'Total page count' }),
        totalRecord: z
          .number()
          .int()
          .positive()
          .openapi({ example: 58, description: 'Total record count' }),
      }),
    }),
  });
};

export type PaginatorRes<T> = z.infer<
  ReturnType<typeof wrapPaginatorResSchema<T>>
>;

export const okPaginator = <T>(
  req: PaginatorReq,
  result: {
    list: Array<T>;
    count: number;
  },
): PaginatorRes<T> => ({
  code: HttpCode.OK,
  message: 'ok',
  data: {
    list: result.list,
    paginator: {
      currentPage: req.currentPage,
      pageSize: req.pageSize,
      totalPage: Math.ceil(result.count / req.pageSize),
      totalRecord: result.count,
    },
  },
});
