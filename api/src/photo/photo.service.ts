import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';
import { Product } from '../product/product.entity';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Injectable()
export class PhotoService {
  private supa;
  private bucket: string;

  constructor(
    @InjectRepository(Photo) private readonly photos: Repository<Photo>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    private readonly cfg: ConfigService,
  ) {
    this.supa = createClient(
      this.cfg.get<string>('SUPABASE_URL')!,
      this.cfg.get<string>('SUPABASE_SERVICE_ROLE')!,
    );
    this.bucket = this.cfg.get<string>('SUPABASE_BUCKET') || 'products';
  }

  private ensureImage(mime: string, size: number) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowed.includes(mime)) {
      throw new BadRequestException('Formato no permitido (usa jpg, png, webp o avif)');
    }
    if (size > 5 * 1024 * 1024) {
      throw new BadRequestException('Archivo demasiado grande (máx 5MB)');
    }
  }

  private extFromMime(m: string) {
    if (m === 'image/jpeg') return '.jpg';
    if (m === 'image/png') return '.png';
    if (m === 'image/webp') return '.webp';
    if (m === 'image/avif') return '.avif';
    return '';
  }

  async upload(productId: string, file: Express.Multer.File) {
    const product = await this.products.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (!file) throw new BadRequestException('Falta archivo');
    this.ensureImage(file.mimetype, file.size);

    const ext = path.extname(file.originalname || '') || this.extFromMime(file.mimetype);
    const key = `${productId}/${uuid()}${ext}`;

    const { error: upErr } = await this.supa
      .storage
      .from(this.bucket)
      .upload(key, file.buffer, { contentType: file.mimetype, upsert: false });

    if (upErr) throw new BadRequestException(`Error subiendo imagen: ${upErr.message}`);

    const rec = this.photos.create({
      product,
      path: key,
      mime: file.mimetype,
      size: file.size,
    });
    const saved = await this.photos.save(rec);

    const { data: signed, error: signErr } = await this.supa
      .storage
      .from(this.bucket)
      .createSignedUrl(key, 60 * 60); // 1 hora

    if (signErr) throw new BadRequestException(`Error firmando URL: ${signErr.message}`);

    return {
      id: saved.id,
      path: key,
      url: signed.signedUrl,
      mime: saved.mime,
      size: saved.size,
    };
  }

  async listByProduct(productId: string) {
    const product = await this.products.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const rows = await this.photos.find({
      where: { product: { id: productId } },
      order: { createdAt: 'DESC' },
    });

    const signed = await Promise.all(
      rows.map(async (p) => {
        const { data, error } = await this.supa
          .storage
          .from(this.bucket)
          .createSignedUrl(p.path, 60 * 60); // 1 hora
        return {
          id: p.id,
          path: p.path,
          url: error ? null : data.signedUrl,
          mime: p.mime,
          size: p.size,
        };
      }),
    );

    return signed;
  }
  async setPrimary(productId: string, photoId: string) {
    const photo = await this.photos.findOne({
      where: { id: photoId },
      relations: { product: true },
    });
    if (!photo || photo.product.id !== productId) {
      throw new NotFoundException('Foto no encontrada para este producto');
    }

    photo.product.coverPath = photo.path;
    await this.products.save(photo.product);

    // devolver URL firmada de la principal
    const { data, error } = await this.supa.storage.from(this.bucket).createSignedUrl(photo.path, 60 * 60);
    if (error) throw new BadRequestException(`Error firmando URL: ${error.message}`);
    return { coverPath: photo.path, coverUrl: data.signedUrl };
  }

  // --- obtener la foto principal (si no hay, usa la primera disponible) ---
  async getCover(productId: string) {
    const product = await this.products.findOne({
      where: { id: productId },
      relations: { photos: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    let path = product.coverPath;
    if (!path) {
      // si no hay principal, intenta tomar la más reciente
      const first = await this.photos.findOne({
        where: { product: { id: productId } },
        order: { createdAt: 'DESC' },
      });
      path = first?.path || null;
    }
    if (!path) return { coverPath: null, coverUrl: null };

    const { data, error } = await this.supa.storage.from(this.bucket).createSignedUrl(path, 60 * 60);
    if (error) throw new BadRequestException(`Error firmando URL: ${error.message}`);
    return { coverPath: path, coverUrl: data.signedUrl };
  }

  // --- borrar foto (de Storage y BD). Si era principal, la limpia o reasigna ---
  async remove(productId: string, photoId: string) {
    const photo = await this.photos.findOne({
      where: { id: photoId },
      relations: { product: true },
    });
    if (!photo || photo.product.id !== productId) {
      throw new NotFoundException('Foto no encontrada para este producto');
    }

    // borrar del bucket
    const { error: remErr } = await this.supa.storage.from(this.bucket).remove([photo.path]);
    if (remErr) throw new BadRequestException(`Error borrando en Storage: ${remErr.message}`);

    // si era principal, limpiar o reasignar
    const prod = photo.product;
    const wasCover = prod.coverPath === photo.path;

    await this.photos.delete(photo.id);

    if (wasCover) {
      const another = await this.photos.findOne({
        where: { product: { id: productId } },
        order: { createdAt: 'DESC' },
      });
      prod.coverPath = another?.path ?? null;
      await this.products.save(prod);
    }

    return { deleted: true, wasCover, newCoverPath: prod.coverPath ?? null };
  }
}