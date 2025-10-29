import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fabric } from './fabric.entity';
import { Product } from '../product/product.entity';
import { FabricService } from './fabric.service';
import { FabricController } from './fabric.controller';
import { ProductFabricController } from './product-fabric.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Fabric, Product])],
  controllers: [FabricController, ProductFabricController],
  providers: [FabricService],
  exports: [FabricService],
})
export class FabricModule {}
