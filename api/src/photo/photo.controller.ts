import { Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PhotoService } from './photo.service';
import * as multer from 'multer';

@Controller('product/:id/photos')
export class PhotoController {
  constructor(private readonly service: PhotoService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  upload(@Param('id') productId: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.upload(productId, file);
  }

  @Get()
  list(@Param('id') productId: string) {
    return this.service.listByProduct(productId);
  }

  // ✅ marcar como principal
  @UseGuards(JwtAuthGuard)
  @Post(':photoId/primary')
  setPrimary(@Param('id') productId: string, @Param('photoId') photoId: string) {
    return this.service.setPrimary(productId, photoId);
  }

  // ✅ obtener URL firmada de la principal (público)
  @Get('cover')
  getCover(@Param('id') productId: string) {
    return this.service.getCover(productId);
  }

  // ✅ borrar foto
  @UseGuards(JwtAuthGuard)
  @Delete(':photoId')
  remove(@Param('id') productId: string, @Param('photoId') photoId: string) {
    return this.service.remove(productId, photoId);
  }
}