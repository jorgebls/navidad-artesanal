import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Design } from './design.entity';
import { Product } from '../product/product.entity';
import { DesignService } from './design.service';
import { DesignController } from './design.controller';
import { ProductDesignController } from './product-design.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Design, Product])],
  controllers: [DesignController, ProductDesignController],
  providers: [DesignService],
  exports: [DesignService],
})
export class DesignModule {}
