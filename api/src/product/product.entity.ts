import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { Photo } from '../photo/photo.entity';
import { Category } from '../category/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ default: false })
  customizable: boolean;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category?: Category | null;

  @RelationId((product: Product) => product.category)
  categoryId?: number | null;

  @OneToMany(() => Photo, (photo) => photo.product, { cascade: false })
  photos: Photo[];

  @Column({ type: 'text', nullable: true }) 
  coverPath: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
