import { type StructuredToolParams, tool } from '@langchain/core/tools';
import { logger } from 'lib-logger';
import { z } from 'zod';

const argsSchema = z.object({
  city: z.string().describe('需要查询天气预报的目标城市，例如：北京'),
});

const schema: StructuredToolParams = {
  name: 'gaode-weather',
  description: '当你想查询天气或者与天气相关的问题时可以使用的工具',
  schema: argsSchema,
};

const gaodeWeather = () => {
  const getWeather = async ({ city }: z.infer<typeof schema.schema>) => {
    const apiKey = process.env.GAODE_API_KEY;
    if (!apiKey) {
      return '请配置高德地图的 API Key';
    }

    const baseUrl = process.env.GAODE_BASE_URL || 'https://restapi.amap.com/v3';
    const cityCodeUrl = `${baseUrl}/config/district?keywords=${city}&subdistrict=0&key=${apiKey}`;

    try {
      const cityCodeRes = await fetch(cityCodeUrl);
      if (!cityCodeRes.ok) {
        return '获取城市编码失败';
      }
      const cityCodeData = await cityCodeRes.json();
      const cityAdcode = cityCodeData.districts[0].adcode;
      if (cityCodeData.info !== 'OK' || !cityAdcode) {
        return '获取城市编码失败';
      }

      const weatherUrl = `${baseUrl}/weather/weatherInfo?city=${cityAdcode}&key=${apiKey}&extensions=all`;
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) {
        return '获取天气信息失败';
      }
      const weatherData = await weatherRes.json();
      if (weatherData.info !== 'OK') {
        return '获取天气信息失败';
      }
      return JSON.stringify(weatherData);
    } catch (e) {
      logger.error(e, '获取天气信息失败');
      return `获取${city}天气信息失败`;
    }
  };

  return tool(getWeather, schema);
};

gaodeWeather.argsSchema = argsSchema;

export { gaodeWeather };
