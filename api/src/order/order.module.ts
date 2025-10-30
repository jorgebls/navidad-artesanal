import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './orderItem.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderStatus } from './order-status.entity';
import { City } from '../location/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderStatus, City])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
