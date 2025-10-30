import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './orderItem.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../user/user.entity';
import { OrderStatus } from './order-status.entity';
import { City } from '../location/city.entity';

const DEFAULT_STATUSES: Array<{ code: OrderStatus['code']; label: string }> = [
  { code: 'IN_PROCESS', label: 'En proceso' },
  { code: 'COMPLETED', label: 'Completado' },
  { code: 'CANCELLED', label: 'Cancelado' },
];

@Injectable()
export class OrderService implements OnModuleInit {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(OrderStatus) private readonly statusRepo: Repository<OrderStatus>,
    @InjectRepository(City) private readonly cityRepo: Repository<City>,
  ) {}

  async onModuleInit() {
    await this.ensureStatuses();
  }

  async listByUser(userId: string) {
    const orders = await this.orderRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: {
        items: true,
        city: { department: true },
        status: true,
      },
    });
    return orders.map((order) => this.mapOrder(order));
  }

  async create(dto: CreateOrderDto, userId?: string) {
    if (!userId) {
      throw new BadRequestException('El usuario autenticado es obligatorio para crear pedidos');
    }

    const city = await this.cityRepo.findOne({
      where: { id: dto.cityId },
      relations: { department: true },
    });
    if (!city) {
      throw new NotFoundException('Ciudad no encontrada');
    }

    if (city.departmentId !== dto.departmentId) {
      throw new BadRequestException('La ciudad no pertenece al departamento seleccionado');
    }

    const status = await this.ensureStatus('IN_PROCESS');

    const order = this.orderRepo.create({
      user: { id: userId } as User,
      customerName: dto.customerName.trim(),
      phone: dto.phone.trim(),
      citySnapshot: city.name,
      city,
      address: dto.address.trim(),
      notes: dto.notes?.trim() ?? null,
      total: String(dto.total.toFixed(2)),
      paymentMethod: 'COD',
      status,
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
    const reloaded = await this.orderRepo.findOne({
      where: { id: saved.id },
      relations: { items: true, city: { department: true }, status: true },
    });
    return this.mapOrder(reloaded!);
  }

  async cancel(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { user: true, status: true },
    });
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('No puedes cancelar este pedido');
    }
    if (order.status.code !== 'IN_PROCESS') {
      throw new BadRequestException('Solo puedes cancelar pedidos en proceso');
    }
    const cancelledStatus = await this.ensureStatus('CANCELLED');
    order.status = cancelledStatus;
    await this.orderRepo.save(order);
    const reloaded = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { items: true, city: { department: true }, status: true },
    });
    return this.mapOrder(reloaded!);
  }

  private async ensureStatuses() {
    await Promise.all(
      DEFAULT_STATUSES.map(async ({ code, label }) => {
        const exists = await this.statusRepo.findOne({ where: { code } });
        if (!exists) {
          await this.statusRepo.save(this.statusRepo.create({ code, label }));
        }
      }),
    );
  }

  private async ensureStatus(code: OrderStatus['code']) {
    const status = await this.statusRepo.findOne({ where: { code } });
    if (!status) {
      throw new BadRequestException(`Estado ${code} no configurado`);
    }
    return status;
  }

  private mapOrder(order: Order) {
    return {
      id: order.id,
      customerName: order.customerName,
      phone: order.phone,
      city: {
        id: order.cityId,
        name: order.citySnapshot,
        department: order.city?.department
          ? {
              id: order.city.departmentId,
              name: order.city.department.name,
            }
          : null,
      },
      address: order.address,
      notes: order.notes,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: {
        code: order.status.code,
        label: order.status.label,
      },
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        size: item.size,
        qty: item.qty,
        unitPrice: item.unitPrice,
        customizations: item.customizations,
      })),
    };
  }
}
