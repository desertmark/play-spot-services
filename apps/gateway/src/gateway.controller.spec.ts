import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from './gateway.controller';

describe('GatewayController', () => {
  let gatewayController: GatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [],
    }).compile();

    gatewayController = app.get<GatewayController>(GatewayController);
  });

  describe('root', () => {
    it('should return status and version', () => {
      expect(gatewayController.getHealth()).toEqual({
        status: 'OK',
        version: '0.0.1',
      });
    });
  });
});
