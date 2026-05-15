import { Module } from '@nestjs/common';
import { AiModule } from './ai.module';
import { PersistenceModule } from './persistence.module';
import { SchedulingModule } from './scheduling.module';

@Module({
  imports: [PersistenceModule, AiModule, SchedulingModule],
  exports: [PersistenceModule, AiModule, SchedulingModule],
})
export class InfrastructureModule {}
