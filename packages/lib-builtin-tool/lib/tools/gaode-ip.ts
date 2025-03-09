import { type StructuredToolParams, tool } from '@langchain/core/tools';
import { logger } from 'lib-logger';
import { z } from 'zod';

const argsSchema = z.object({
  ip: z
    .string()
    .ip({ version: 'v4' })
    .describe('需要查询所在地的IPv4地址，例如：114.247.50.2'),
});

const schema: StructuredToolParams = {
  name: 'gaode-ip',
  description: '当你想查询ip所在地址的问题时可以使用的工具',
  schema: argsSchema,
};

const gaodeIp = () => {
  const getIp = async ({ ip }: z.infer<typeof schema.schema>) => {
    const apiKey = process.env.GAODE_API_KEY;
    if (!apiKey) {
      return '请配置高德地图的 API Key';
    }

    const baseUrl = process.env.GAODE_BASE_URL || 'https://restapi.amap.com/v3';
    const ipUrl = `${baseUrl}/ip?ip=${ip}&key=${apiKey}`;

    try {
      const ipRes = await fetch(ipUrl);
      if (!ipRes.ok) {
        return '获取IP所在地失败';
      }
      const ipData = await ipRes.json();
      if (ipData.info !== 'OK') {
        return '获取IP所在地失败';
      }

      const ipProvince = ipData.province;
      const ipCity = ipData.city;
      if (ipProvince === ipCity) {
        return ipCity;
      }

      return `${ipProvince}${ipCity}`;
    } catch (e) {
      logger.error(e, '获取天气信息失败');
      return `获取${ip}所在地信息失败`;
    }
  };

  return tool(getIp, schema);
};

gaodeIp.argsSchema = argsSchema;

export { gaodeIp };
