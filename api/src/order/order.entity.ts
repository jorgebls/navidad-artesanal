import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { OrderItem } from './orderItem.entity';
import { User } from '../user/user.entity';
import { City } from '../location/city.entity';
import { OrderStatus } from './order-status.entity';

export type OrderStatusCode = 'IN_PROCESS' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'COD';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @RelationId((order: Order) => order.user)
  userId: string;

  @Column({ type: 'varchar', length: 150 })
  customerName: string;

  @Column({ type: 'varchar', length: 40 })
  phone: string;

  @Column({ type: 'varchar', length: 100 })
  citySnapshot: string;

  @ManyToOne(() => City, (city) => city.orders, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cityId' })
  city: City;

  @Column()
  cityId: number;

  @Column({ type: 'varchar', length: 200 })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: string; // stored as string by TypeORM decimal

  @ManyToOne(() => OrderStatus, (status) => status.orders, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'statusId' })
  status: OrderStatus;

  @Column()
  statusId: number;

  @Column({ type: 'varchar', length: 10, default: 'COD' })
  paymentMethod: PaymentMethod;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
