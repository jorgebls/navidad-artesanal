import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './orderItem.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
  ) {}

  async create(dto: CreateOrderDto) {
    const order = this.orderRepo.create({
      customerName: dto.customerName,
      phone: dto.phone,
      city: dto.city,
      address: dto.address,
      notes: dto.notes ?? null,
      total: String(dto.total.toFixed(2)),
      paymentMethod: 'COD',
      status: 'PENDING',
      items: dto.items.map((i) =>
        this.itemRepo.create({
          productId: i.productId,
          productName: i.productName,
          size: i.size.toUpperCase(),
          qty: i.qty,
          unitPrice: String(i.unitPrice.toFixed(2)),
          customizations: i.customizations ?? null,
        }),
      ),
    });

    const saved = await this.orderRepo.save(order);
    return { id: saved.id, createdAt: saved.createdAt, status: saved.status };
  }
}


