import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../product/product.entity';
import { Size } from '../size/size.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @OneToMany(() => Product, (product) => product.category, { cascade: false })
  products: Product[];

  @OneToMany(() => Size, (size) => size.category, { cascade: ['remove'] })
  sizes: Size[];

  @CreateDateColumn()
  createdAt: Date;
}
