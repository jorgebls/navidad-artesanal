import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DesignService } from './design.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('product/:productId/designs')
export class ProductDesignController {
  constructor(private readonly service: DesignService) {}

  @Get()
  list(@Param('productId') productId: string) {
    return this.service.listByProduct(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':designId')
  attach(
    @Param('productId') productId: string,
    @Param('designId') designId: string,
  ) {
    return this.service.attachToProduct(productId, Number(designId));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':designId')
  detach(
    @Param('productId') productId: string,
    @Param('designId') designId: string,
  ) {
    return this.service.detachFromProduct(productId, Number(designId));
  }
}
