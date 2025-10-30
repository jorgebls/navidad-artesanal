import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('order')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async listMine(@Req() req: Request) {
    const payload = req.user as { userId: string };
    return this.service.listByUser(payload.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const userId = (req.user as { userId?: string })?.userId;
    return await this.service.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req: Request) {
    const payload = req.user as { userId: string };
    return this.service.cancel(id, payload.userId);
  }
}
