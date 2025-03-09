import type { ZodObject, ZodRawShape } from 'zod';
import builtinToolCategories from './categories.json';
import builtinTools from './provider-tools.json';
import { currentTime } from './tools/current-time';
import { dalle3 } from './tools/dalle3';
import { duckduckgoSearch } from './tools/duckduckgo-search';
import { gaodeIp } from './tools/gaode-ip';
import { gaodeWeather } from './tools/gaode-weather';
import { wikipediaSearch } from './tools/wikipedia-search';

const BUILTIN_TOOLS = {
  currentTime,
  dalle3,
  duckduckgoSearch,
  gaodeIp,
  gaodeWeather,
  wikipediaSearch,
};

export const getBuiltinToolCategories = () => builtinToolCategories;

const getSchemaMetadata = (schema: ZodObject<ZodRawShape>) => {
  const shape = schema.shape;
  const metadata = Object.keys(shape).map((key) => {
    const fieldSchema = shape[key];
    return {
      name: key,
      type: fieldSchema._def.typeName.toLowerCase().replace('zod', ''),
      required: !fieldSchema.isOptional(),
      description: fieldSchema._def.description,
    };
  });
  return metadata;
};

const formatParams = (params: Record<string, unknown>[]) => {
  return params.map((param) => ({
    ...param,
    default: param.default ?? null,
    min: param.min ?? null,
    max: param.max ?? null,
    help: param.help ?? '',
  }));
};

export const getAllBuiltinTools = () => {
  const result = [];
  for (const provider of builtinTools) {
    result.push({
      ...provider,
      createdAt: provider.created_at * 1000,
      tools: provider.tools.map((tool) => {
        const toolBuilder =
          BUILTIN_TOOLS[tool.name as keyof typeof BUILTIN_TOOLS];
        const argsSchema = toolBuilder.argsSchema;
        let inputs: Array<{
          name: string;
          type: string;
          required: boolean;
          description: string;
        }> = [];
        if (argsSchema) {
          inputs = getSchemaMetadata(argsSchema);
        }

        return {
          ...tool,
          inputs,
          params: formatParams(tool.params),
        };
      }),
    });
  }
  return result;
};

export const getSpecificTool = (providerName: string, toolName: string) => {
  const provider = builtinTools.find((p) => p.name === providerName);
  if (!provider) {
    return null;
  }
  const providerResult = {
    name: provider.name,
    label: provider.label,
    description: provider.description,
    category: provider.category,
    background: provider.background,
  };

  const tool = provider.tools.find((t) => t.name === toolName);
  if (!tool) {
    return null;
  }
  const toolBuilder = BUILTIN_TOOLS[tool.name as keyof typeof BUILTIN_TOOLS];
  const inputs = toolBuilder.argsSchema
    ? getSchemaMetadata(toolBuilder.argsSchema)
    : [];

  return {
    provider: providerResult,
    name: tool.name,
    label: tool.label,
    description: tool.description,
    inputs,
    params: formatParams(tool.params),
  };
};
