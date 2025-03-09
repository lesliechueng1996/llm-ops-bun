import { describeRoute } from 'hono-openapi';
import { wrapResponseSchema, z } from '../common';
import { resolver } from 'hono-openapi/zod';

const getBuiltinToolsCategoriesResSchema = wrapResponseSchema(
  z.array(
    z.object({
      category: z
        .string()
        .openapi({ example: 'search', description: 'Category type' }),
      name: z
        .string()
        .openapi({ example: '搜索', description: 'Category name' }),
      icon: z
        .string()
        .openapi({ example: 'search.svg', description: 'Category icon' }),
    }),
  ),
);

export const getCategoriesRoute = describeRoute({
  tags: ['builtin-tools'],
  description: 'Get builtin tools categories',
  responses: {
    200: {
      description: 'Successful fetch builtin tools categories',
      content: {
        'application/json': {
          schema: resolver(getBuiltinToolsCategoriesResSchema),
        },
      },
    },
  },
});

export type GetBuiltinToolsCategoriesRes = z.infer<
  typeof getBuiltinToolsCategoriesResSchema
>;
