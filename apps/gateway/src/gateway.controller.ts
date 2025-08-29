import { Controller, Get } from '@nestjs/common';
@Controller()
export class GatewayController {
  @Get('health')
  getHealth(): any {
    return {
      status: 'OK',
      version: '0.0.1',
    };
  }
}
