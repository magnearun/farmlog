import { AuthenticationError } from 'apollo-server-core';
import { UseMiddleware } from 'type-graphql';
import { Context } from '../types/interfaces/Context';

export function Authorized() {
  return UseMiddleware(
    async (
      { args, context, info }: { args: any; context: Context; info: any },
      next
    ) => {
      const { session = {} } = info || {};
      if (!context.user && !session.user) {
        throw new AuthenticationError('Must be authenticated');
      }

      return next();
    }
  );
}
