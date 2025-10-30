import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Department } from './department.entity';
import { Order } from '../order/order.entity';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Department, (department) => department.cities, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column()
  departmentId: number;

  @OneToMany(() => Order, (order) => order.city)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;
}

