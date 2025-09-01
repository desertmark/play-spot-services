import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RequiredBodyGuard implements CanActivate {
  private readonly logger = new Logger(RequiredBodyGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.body) {
      this.logger.warn('Request body is missing');
      throw new UnprocessableEntityException('Request body is missing');
    }
    return true;
  }
}

export const RequiredBody = () => UseGuards(RequiredBodyGuard);
