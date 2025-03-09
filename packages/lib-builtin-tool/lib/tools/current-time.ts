import { type StructuredToolParams, tool } from '@langchain/core/tools';
import dayjs from 'dayjs';
import { z } from 'zod';

const schema: StructuredToolParams = {
  name: 'current-time',
  description: '一个用于获取当前时间的工具',
  schema: z.object({}),
};

const currentTime = () => {
  return tool(async () => {
    return dayjs().format('YYYY-MM-DDTHH:mm:ssZ[Z]');
  }, schema);
};

currentTime.argsSchema = null;

export { currentTime };
