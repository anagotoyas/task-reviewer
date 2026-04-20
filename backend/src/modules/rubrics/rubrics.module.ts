import { Module } from '@nestjs/common';
import { RubricsService } from './rubrics.service';
import { RubricsController } from './rubrics.controller';

@Module({
  controllers: [RubricsController],
  providers: [RubricsService],
})
export class RubricsModule {}
