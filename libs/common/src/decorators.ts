import { Inject, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GRPC_USERS_CLIENT } from './constants';
import { Metadata as GrpcMetadata } from '@grpc/grpc-js';

export const InjectUsersClient = () => Inject(GRPC_USERS_CLIENT);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const CurrentMeta = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const meta = new GrpcMetadata();
    meta.set('authorization', request.headers?.authorization);
    meta.set('user', JSON.stringify(request.user));
    return meta;
  },
);
