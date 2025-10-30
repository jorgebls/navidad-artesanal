import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './department.entity';
import { City } from './city.entity';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Department, City])],
  providers: [LocationService],
  controllers: [LocationController],
  exports: [TypeOrmModule, LocationService],
})
export class LocationModule {}

