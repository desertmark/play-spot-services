import { Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/microservices';
import type { RequestContext, BaseRpcContext } from '@nestjs/microservices';

@Injectable({ scope: Scope.REQUEST })
export class ContextService {
  constructor(
    @Inject(CONTEXT) private reqContext: RequestContext<any, BaseRpcContext>, //BaseRpcContext is forced by nestjs but runtime type is Metadata
  ) {}

  public get userId(): string | undefined {
    return this.getMetadataValue('userId');
  }

  public get authHeader(): string | undefined {
    return this.getMetadataValue('authorization');
  }

  private get metadata(): Metadata {
    return this.reqContext?.context as unknown as Metadata;
  }

  private getMetadataValue(key: string): string | undefined {
    return this.metadata?.get(key)?.[0] as string | undefined;
  }
}
