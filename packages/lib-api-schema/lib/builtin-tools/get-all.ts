import { describeRoute } from 'hono-openapi';
import { wrapResponseSchema, z } from '../common';
import { resolver } from 'hono-openapi/zod';

const getBuiltinToolsResSchema = wrapResponseSchema(
  z.array(
    z.object({
      name: z
        .string()
        .openapi({ example: 'dalle', description: 'Provider name' }),
      label: z
        .string()
        .openapi({ example: 'DALLE', description: 'Provider label' }),
      description: z.string().openapi({
        example: 'DALLE是一个文生图工具',
        description: 'Provider description',
      }),
      category: z
        .string()
        .openapi({ example: 'image', description: 'Category type' }),
      background: z.string().openapi({
        example: '#E5E7EB',
        description: 'Provider background color',
      }),
      icon: z
        .string()
        .openapi({ example: 'icon.png', description: 'Provider icon name' }),
      tools: z.array(
        z.object({
          name: z
            .string()
            .openapi({ example: 'dalle3', description: 'Tool name' }),
          label: z
            .string()
            .openapi({ example: 'DALLE-3绘图工具', description: 'Tool label' }),
          description: z.string().openapi({
            example: 'DALLE-3是一个将文本转换成图片的绘图工具',
            description: 'Tool description',
          }),
          inputs: z.array(
            z.object({
              name: z.string().openapi({
                example: 'query',
                description: 'LLM input parameter',
              }),
              description: z.string().openapi({
                example: '输入应该是生成图像的文本提示(prompt)',
                description: 'LLM input description',
              }),
              required: z
                .boolean()
                .openapi({ example: true, description: 'LLM input required' }),
              type: z
                .string()
                .openapi({ example: 'string', description: 'LLM input type' }),
            }),
          ),
          params: z.array(
            z.object({
              name: z.string().openapi({
                example: 'size',
                description: 'Customized parameter name',
              }),
              label: z.string().openapi({
                example: '图像大小',
                description: 'Customized parameter label',
              }),
              type: z.enum(['number', 'string', 'boolean', 'select']).openapi({
                example: 'number',
                description: 'Customized parameter type',
              }),
              required: z.boolean().openapi({
                example: true,
                description: 'Customized parameter required',
              }),
              default: z.string().nullable().openapi({
                example: '256',
                description: 'Customized parameter default value',
              }),
              min: z.number().nullable().openapi({
                example: 1,
                description: 'Customized parameter min value',
              }),
              max: z.number().nullable().openapi({
                example: 512,
                description: 'Customized parameter max value',
              }),
              help: z.string().openapi({
                example: '图像大小',
                description: 'Customized parameter help information',
              }),
              options: z.array(
                z.object({
                  value: z
                    .string()
                    .openapi({ example: '256', description: 'Option value' }),
                  label: z
                    .string()
                    .openapi({ example: '256', description: 'Option label' }),
                }),
              ),
            }),
          ),
        }),
      ),
      createdAt: z.number().openapi({
        example: 1721460914000,
        description: 'Provider created timestamp(ms)',
      }),
    }),
  ),
);

export const getBuiltinToolsRoute = describeRoute({
  tags: ['builtin-tools'],
  description: 'Get all builtin tools',
  responses: {
    200: {
      description: 'Successful fetch builtin tools',
      content: {
        'application/json': {
          schema: resolver(getBuiltinToolsResSchema),
        },
      },
    },
  },
});

export type GetBuiltinToolsRes = z.infer<typeof getBuiltinToolsResSchema>;
