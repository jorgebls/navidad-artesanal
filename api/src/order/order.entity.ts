import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from './orderItem.entity';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type PaymentMethod = 'COD';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  customerName: string;

  @Column({ type: 'varchar', length: 40 })
  phone: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 200 })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: string; // stored as string by TypeORM decimal

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 10, default: 'COD' })
  paymentMethod: PaymentMethod;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}


