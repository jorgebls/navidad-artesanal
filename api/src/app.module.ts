// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { PhotoModule } from './photo/photo.module';
import { CategoryModule } from './category/category.module';
import { DesignModule } from './design/design.module';
import { FabricModule } from './fabric/fabric.module';
import { OrderModule } from './order/order.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('DB_HOST'),
        port: Number(cfg.get<string>('DB_PORT')),
        username: cfg.get<string>('DB_USER'),
        password: cfg.get<string>('DB_PASSWORD'),
        database: cfg.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // solo en dev
        // evitar "self-signed certificate in certificate chain"
        ssl: { rejectUnauthorized: false },
        extra: { ssl: { rejectUnauthorized: false } },
        uuidExtension: 'pgcrypto',
      }),
    }),

    UserModule,

    AuthModule,

    CategoryModule,

    DesignModule,

    FabricModule,

    ProductModule,

    PhotoModule,

    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
