import { ReservationsModule } from './reservations.module';
import { GRPC_RESERVATIONS_PACKAGE } from '@app/common/constants';
import { GrpcNestFactory } from '@app/common/grpc';

async function bootstrap() {
  const app = await GrpcNestFactory.createGrpcMicroservice({
    module: ReservationsModule,
    packageName: GRPC_RESERVATIONS_PACKAGE,
    protos: ['reservations.proto'],
  });
  await app.listen();
}
bootstrap();
