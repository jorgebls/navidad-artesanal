import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly service: LocationService) {}

  @Get('departments')
  listDepartments() {
    return this.service.listDepartments();
  }

  @Get('departments/:id/cities')
  listCities(@Param('id') id: string) {
    return this.service.listCitiesByDepartment(Number(id));
  }
}

