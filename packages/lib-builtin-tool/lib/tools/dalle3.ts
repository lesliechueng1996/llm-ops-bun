import { DallEAPIWrapper } from '@langchain/openai';
import { z } from 'zod';

const customParamsSchema = z.object({
  size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional(),
  style: z.enum(['natural', 'vivid']).optional(),
});

type CustomParams = z.infer<typeof customParamsSchema>;

const dalle3 = (params?: CustomParams) => {
  const tool = new DallEAPIWrapper({
    n: 1,
    model: 'dall-e-3',
    ...params,
  });

  return tool;
};

dalle3.argsSchema = z.object({
  input: z.string().describe('输入应该是生成图像的文本提示(prompt)'),
});

export { dalle3 };
