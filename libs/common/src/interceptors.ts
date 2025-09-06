import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ContextService } from './users/context.service';
import { ModuleRef, Reflector } from '@nestjs/core';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private moduleRef: ModuleRef) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const { requestId } = await this.moduleRef.resolve(
      ContextService,
      undefined,
      {
        strict: false,
      },
    );
    Logger.log(context.getArgByIndex(2).path, `REQ: ${requestId}`);
    return next.handle();
  }
}
