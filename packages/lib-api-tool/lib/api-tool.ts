import { BadRequestApiError, NotFoundApiError } from 'lib-api-schema';
import type {
  CreateApiToolReq,
  GetApiToolsReq,
  UpdateApiToolProviderBodyReq,
} from 'lib-api-schema/lib/api-tools';
import { calculateTakeSkip } from 'lib-common';
import { getApiToolByOperationId } from 'lib-prisma/lib/api-tool';
import {
  deleteApiToolProviderAndTools,
  getApiToolProviderById,
  getApiToolProvidersWithToolByPagination,
  hasSameToolProviderNameInAccount,
  saveApiToolProvider,
  updateApiToolProviderAndResetTools,
} from 'lib-prisma/lib/api-tool-provider';
import {
  type ApiToolParameter,
  type Openapi,
  validateOpenapiSchema,
} from './openapi-schema';

export const createApiTool = async (
  data: CreateApiToolReq,
  accountId: string,
) => {
  const { name, icon, openapiSchema, headers } = data;
  let openapiSchemaObj: Openapi | null = null;
  try {
    openapiSchemaObj = validateOpenapiSchema(openapiSchema);
  } catch (err) {
    throw new BadRequestApiError((err as Error).message);
  }

  const hasSameName = await hasSameToolProviderNameInAccount(accountId, name);
  if (hasSameName) {
    throw new BadRequestApiError('已存在同名的API工具');
  }

  await saveApiToolProvider(accountId, name, icon, headers, openapiSchemaObj);
};

export const getApiToolsPagination = async (
  data: GetApiToolsReq,
  accountId: string,
) => {
  const { take, skip } = calculateTakeSkip(data);
  const { list, count } = await getApiToolProvidersWithToolByPagination(
    accountId,
    data.searchWord || null,
    take,
    skip,
  );
  return {
    count,
    list: list.map((provider) => ({
      id: provider.id,
      name: provider.name,
      icon: provider.icon,
      description: provider.description,
      createdAt: provider.createdAt.getTime(),
      headers: provider.headers,
      tools: provider.apiTools.map((tool) => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        inputs: ((tool.parameters ?? []) as ApiToolParameter).map((param) => ({
          type: param.type,
          name: param.name,
          description: param.description,
          required: param.required,
        })),
      })),
    })),
  };
};

export const deleteApiToolProvider = async (
  providerId: string,
  accountId: string,
) => {
  await deleteApiToolProviderAndTools(providerId, accountId);
};

export const getApiToolProviderInfo = async (
  providerId: string,
  accountId: string,
) => {
  const provider = await getApiToolProviderById(providerId, accountId);
  if (!provider) {
    throw new NotFoundApiError('API工具不存在');
  }
  return {
    id: provider.id,
    name: provider.name,
    icon: provider.icon,
    createdAt: provider.createdAt.getTime(),
    openapiSchema: JSON.stringify(provider.openapiSchema),
    headers: provider.headers,
  };
};

export const getApiToolInfo = async (
  providerId: string,
  operationId: string,
  accountId: string,
) => {
  const tool = await getApiToolByOperationId(
    providerId,
    operationId,
    accountId,
  );
  if (!tool) {
    throw new NotFoundApiError('API工具不存在');
  }
  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    inputs: ((tool.parameters ?? []) as ApiToolParameter).map((param) => ({
      type: param.type,
      name: param.name,
      description: param.description,
      required: param.required,
    })),
    provider: {
      id: tool.provider.id,
      name: tool.provider.name,
      icon: tool.provider.icon,
      description: tool.provider.description,
      headers: tool.provider.headers,
    },
  };
};

export const updateApiToolProviderAndTools = async (
  providerId: string,
  accountId: string,
  data: UpdateApiToolProviderBodyReq,
) => {
  const { name, openapiSchema } = data;

  let openapiSchemaObj: Openapi | null = null;
  try {
    openapiSchemaObj = validateOpenapiSchema(openapiSchema);
  } catch (err) {
    throw new BadRequestApiError((err as Error).message);
  }

  const hasSameName = await hasSameToolProviderNameInAccount(
    accountId,
    name,
    providerId,
  );
  if (hasSameName) {
    throw new BadRequestApiError('已存在同名的API工具');
  }

  await updateApiToolProviderAndResetTools(
    accountId,
    providerId,
    openapiSchemaObj,
    data,
  );
};
