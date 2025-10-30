import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  RelationId,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Photo } from '../photo/photo.entity';
import { Category } from '../category/category.entity';
import { Design } from '../design/design.entity';
import { Fabric } from '../fabric/fabric.entity';

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

  @Column({ type: 'jsonb', nullable: true })
  sizes?: Array<{
    sizeId: number;
    price: number;
    description: string;
    image?: string | null;
  }> | null;

  @Column({ type: 'jsonb', nullable: true })
  customizationOptions?: Array<{
    id: string;
    name: string;
    required: boolean;
    options: Array<{
      id: string;
      name: string;
      value: string;
      price?: number;
      image?: string | null;
    }>;
  }> | null;

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

  @ManyToMany(() => Design, (design) => design.products, { cascade: false })
  @JoinTable({
    name: 'product_designs',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'designId', referencedColumnName: 'id' },
  })
  designs: Design[];

  @ManyToMany(() => Fabric, (fabric) => fabric.products, { cascade: false })
  @JoinTable({
    name: 'product_fabrics',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'fabricId', referencedColumnName: 'id' },
  })
  fabrics: Fabric[];

  @Column({ type: 'text', nullable: true }) 
  coverPath: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
