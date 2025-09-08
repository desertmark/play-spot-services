import { FacilitiesModule } from './facilities.module';
import { GRPC_FACILITIES_PACKAGE } from '@app/common/constants';
import { GrpcNestFactory } from '@app/common/grpc';

async function bootstrap() {
  const app = await GrpcNestFactory.createGrpcMicroservice({
    module: FacilitiesModule,
    packageName: GRPC_FACILITIES_PACKAGE,
    protos: ['establishments.proto', 'units.proto', 'slots.proto'],
  });
  await app.listen();
}
bootstrap();
