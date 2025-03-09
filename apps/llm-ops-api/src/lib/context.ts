import { getContext } from 'hono/context-storage';

export type Context = {
  Variables: {
    accountId: string;
  };
};

export const getAccountId = (): string => {
  return getContext<Context>().var.accountId;
};
