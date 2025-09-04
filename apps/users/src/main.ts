import { UsersModule } from './users.module';
import { GRPC_USERS_PACKAGE } from '@app/common/constants';
import { GrpcNestFactory } from '@app/common/grpc';

async function bootstrap() {
  const app = await GrpcNestFactory.createGrpcMicroservice({
    module: UsersModule,
    packageName: GRPC_USERS_PACKAGE,
    protos: ['users.proto'],
  });
  await app.listen();
}
bootstrap();
