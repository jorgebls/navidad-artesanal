import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FabricService } from './fabric.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('product/:productId/fabrics')
export class ProductFabricController {
  constructor(private readonly service: FabricService) {}

  @Get()
  list(@Param('productId') productId: string) {
    return this.service.listByProduct(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':fabricId')
  attach(
    @Param('productId') productId: string,
    @Param('fabricId') fabricId: string,
  ) {
    return this.service.attachToProduct(productId, Number(fabricId));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':fabricId')
  detach(
    @Param('productId') productId: string,
    @Param('fabricId') fabricId: string,
  ) {
    return this.service.detachFromProduct(productId, Number(fabricId));
  }
}
