import { prisma } from './prisma';

export const getApiToolByOperationId = async (
  providerId: string,
  name: string,
  accountId: string,
) => {
  return prisma.apiTool.findUnique({
    where: {
      uk_api_tool_provider_id_name: {
        providerId,
        name,
      },
      accountId,
    },
    include: {
      provider: true,
    },
  });
};
