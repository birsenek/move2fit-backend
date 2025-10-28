// src/guards/api-key.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['x-api-key'];
    const valid = this.config.get<string>('API_KEY');

    if (!key || key !== valid) {
      throw new UnauthorizedException('Api-Key inválida ou ausente');
    }
    return true;
  }
}