import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/di/infrastructure.module.js';

@Module({
  imports: [InfrastructureModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
