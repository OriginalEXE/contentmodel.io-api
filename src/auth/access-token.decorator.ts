import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface AccessToken {
  sub: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getAccesToken(req: any): AccessToken {
  return req.user;
}

export const AccessTokenEntity = createParamDecorator<AccessToken>(
  async (_data, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context);
    return getAccesToken(gqlContext.getContext().req);
  },
);
