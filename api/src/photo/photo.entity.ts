import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../product/product.entity';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (p) => p.photos, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  path: string;        // clave en Storage: productId/uuid.ext

  @Column()
  mime: string;

  @Column('int')
  size: number;

  @CreateDateColumn()
  createdAt: Date;
}