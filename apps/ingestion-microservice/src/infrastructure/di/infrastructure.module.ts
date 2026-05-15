import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence.module';
import { MessagingModule } from './messaging.module';
import { SchedulingModule } from './scheduling.module';

@Module({
  imports: [PersistenceModule, MessagingModule, SchedulingModule],
  exports: [PersistenceModule, MessagingModule, SchedulingModule],
})
export class InfrastructureModule {}
