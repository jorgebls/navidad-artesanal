import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Category } from '../category/category.entity';
import { Product } from '../product/product.entity';

type CategorySeed = {
  key: string;
  name: string;
  description?: string;
};

const CATEGORY_SEEDS: CategorySeed[] = [
  {
    key: 'bola',
    name: 'Bolas navideñas',
    description: 'Esferas decorativas y personalizables para el árbol.',
  },
  {
    key: 'moño',
    name: 'Moños',
    description: 'Moños artesanales para adornar regalos o espacios.',
  },
  {
    key: 'caja',
    name: 'Cajas decorativas',
    description: 'Contenedores temáticos para obsequios o decoración.',
  },
  {
    key: 'tambor',
    name: 'Tambores',
    description: 'Mini tambores y figuras alusivas hechos a mano.',
  },
];

async function bootstrap() {
  console.log('Iniciando seed de categorías...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const dataSource = app.get(DataSource);
    const categoryRepo = dataSource.getRepository(Category);
    const productRepo = dataSource.getRepository(Product);

    const categoryMap = new Map<string, Category>();

    for (const seed of CATEGORY_SEEDS) {
      console.log(`Procesando categoría base "${seed.name}"...`);
      let category = await categoryRepo.findOne({ where: { name: seed.name } });
      if (!category) {
        console.log(`Creando categoría "${seed.name}"`);
        category = categoryRepo.create({
          name: seed.name,
          description: seed.description,
        });
        category = await categoryRepo.save(category);
      }
      categoryMap.set(seed.key, category);
    }

    const products = await productRepo.find();
    console.log(`Productos encontrados: ${products.length}`);

    for (const product of products) {
      const text = `${product.name} ${product.description ?? ''}`.toLowerCase();
      let match: Category | undefined;

      for (const [key, category] of categoryMap.entries()) {
        if (text.includes(key)) {
          match = category;
          break;
        }
      }

      if (!match) continue;

      if (product.categoryId === match.id) continue;

      console.log(`Asignando categoría "${match.name}" a producto "${product.name}"`);
      product.category = match;
      await productRepo.save(product);
    }

    console.log('Seed de categorías completado');
  } catch (err) {
    console.error('Error ejecutando seed:', err);
    process.exitCode = 1;
  } finally {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await app.close();
    process.exit(process.exitCode ?? 0);
  }
}

bootstrap();
