import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosModule } from '../photos/photos.module';
import { DaysController } from './days.controller';
import { DaysService } from './days.service';
import { Day } from './entities/day.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Day]), PhotosModule],
  controllers: [DaysController],
  providers: [DaysService],
})
export class DaysModule {}
