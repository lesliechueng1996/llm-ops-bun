import type { Prisma } from '@prisma/client';
import type { Openapi } from 'lib-api-tool/lib/openapi-schema';
import { prisma } from './prisma';

export const hasSameToolProviderNameInAccount = async (
  accountId: string,
  name: string,
  selfProviderId?: string,
) => {
  const where: Prisma.ApiToolProviderWhereInput = {
    accountId,
    name,
  };
  if (selfProviderId) {
    where.id = {
      not: selfProviderId,
    };
  }
  const count = await prisma.apiToolProvider.count({
    where,
  });
  return count > 0;
};

const formatApiTools = (openapi: Openapi, accountId: string) => {
  const tools: {
    accountId: string;
    name: string;
    description: string;
    url: string;
    method: string;
    parameters: Record<string, string | boolean>[];
  }[] = [];

  for (const path in openapi.paths) {
    const pathObj = openapi.paths[path];
    for (const method in pathObj) {
      const methodObj = pathObj[method as keyof typeof pathObj];
      if (!methodObj) {
        continue;
      }
      tools.push({
        accountId,
        name: methodObj.operationId,
        description: methodObj.description,
        url: `${openapi.server}${path}`,
        method,
        parameters: methodObj.parameters,
      });
    }
  }

  return tools;
};

export const saveApiToolProvider = async (
  accountId: string,
  name: string,
  icon: string,
  headers: Record<'key' | 'value', string>[],
  openapiObj: Openapi,
) => {
  const tools = formatApiTools(openapiObj, accountId);

  prisma.apiToolProvider.create({
    data: {
      accountId,
      name,
      icon,
      description: openapiObj.description,
      openapiSchema: openapiObj,
      headers,
      apiTools: {
        createMany: {
          data: tools,
        },
      },
    },
  });
};

export const getApiToolProvidersWithToolByPagination = async (
  accountId: string,
  nameLike: string | null,
  take: number,
  skip: number,
) => {
  const where: Prisma.ApiToolProviderWhereInput = {
    accountId,
  };

  if (nameLike) {
    where.name = {
      contains: nameLike,
    };
  }

  const listPromise = prisma.apiToolProvider.findMany({
    where,
    take,
    skip,
    include: {
      apiTools: true,
    },
  });

  const countPromise = prisma.apiToolProvider.count({
    where,
  });

  const [list, count] = await Promise.all([listPromise, countPromise]);

  return {
    list,
    count,
  };
};

export const deleteApiToolProviderAndTools = async (
  providerId: string,
  accountId: string,
) => {
  const deleteApiTools = prisma.apiTool.deleteMany({
    where: {
      providerId,
      accountId,
    },
  });

  const deleteApiToolProvider = prisma.apiToolProvider.deleteMany({
    where: {
      id: providerId,
      accountId,
    },
  });

  await prisma.$transaction([deleteApiTools, deleteApiToolProvider]);
};

export const getApiToolProviderById = async (
  providerId: string,
  accountId: string,
) => {
  return prisma.apiToolProvider.findUnique({
    where: {
      id: providerId,
      accountId,
    },
  });
};

export const updateApiToolProviderAndResetTools = async (
  accountId: string,
  providerId: string,
  openapi: Openapi,
  updateObj: Prisma.ApiToolProviderUpdateInput,
) => {
  const deleteRelatedToolsPrisma = prisma.apiTool.deleteMany({
    where: {
      accountId,
      providerId,
    },
  });

  const updateApiToolProviderPrisma = prisma.apiToolProvider.update({
    data: updateObj,
    where: {
      id: providerId,
      accountId,
    },
  });

  const tools = formatApiTools(openapi, accountId);
  const insertNewToolsPrisma = prisma.apiTool.createMany({
    data: tools.map((tool) => ({
      ...tool,
      providerId: providerId,
    })),
  });

  await prisma.$transaction([
    deleteRelatedToolsPrisma,
    updateApiToolProviderPrisma,
    insertNewToolsPrisma,
  ]);
};
