import { describeRoute } from 'hono-openapi';
import { successEmptyResponseSchema, z, zValidator } from '../common';
import { resolver } from 'hono-openapi/zod';

const deleteApiToolProviderReqSchema = z.object({
  providerId: z
    .string()
    .openapi({ description: 'Api tool provider id', example: 'xxxxxxxx' }),
});

export type DeleteApiToolProviderReq = z.infer<
  typeof deleteApiToolProviderReqSchema
>;

export const deleteApiToolProviderValidator = zValidator(
  'param',
  deleteApiToolProviderReqSchema,
);

export const deleteApiToolProviderRoute = describeRoute({
  tags: ['api-tools'],
  description: 'Delete the api tool provider and all the tools under it',
  responses: {
    200: {
      description: 'Successful delete the api tool provider',
      content: {
        'application/json': {
          schema: resolver(successEmptyResponseSchema),
        },
      },
    },
  },
});
