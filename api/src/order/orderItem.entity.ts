import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @Column({ type: 'varchar' })
  productId: string;

  @Column({ type: 'varchar' })
  productName: string;

  @Column({ type: 'varchar', length: 10, default: 'UNIQUE' })
  size: string;

  @Column({ type: 'int' })
  qty: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: string; // TypeORM decimal -> string

  @Column({ type: 'json', nullable: true })
  customizations?: Record<string, string> | null;
}

