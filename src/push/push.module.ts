import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Day } from '../days/entities/day.entity';
import { PushSubscription } from './entities/push-subscription.entity';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { ReminderScheduler } from './reminder.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([PushSubscription, Day])],
  controllers: [PushController],
  providers: [PushService, ReminderScheduler],
})
export class PushModule {}
