import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  label: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @OneToMany(() => Order, (order) => order.status)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;
}

