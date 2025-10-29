import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Product } from '../product/product.entity';
import { Category } from '../category/category.entity';
import { Design } from '../design/design.entity';
import { Fabric } from '../fabric/fabric.entity';
import { Photo } from '../photo/photo.entity';

const CATEGORIES = [
  {
    slug: 'bola',
    name: 'Bolas navideñas',
    description: 'Esferas decorativas artesanales para el árbol.',
    designs: [
      { name: 'Estrella Dorada', description: 'Aplicación brillante en forma de estrella.', colorHex: '#FFD700', extraCost: '15000' },
      { name: 'Copos de Nieve', description: 'Copos blancos con relieve.', colorHex: '#E8F1FF', extraCost: '12000' },
      { name: 'Nochebuena', description: 'Flores rojas pintadas a mano.', colorHex: '#B71C1C', extraCost: '18000' },
    ],
    fabrics: [
      { name: 'Terciopelo Carmín', type: 'premium', description: 'Terciopelo suave color rojo profundo.', colorHex: '#8C1B1B', extraCost: '8000' },
      { name: 'Satín Dorado', type: 'brillante', description: 'Satín luminoso color dorado.', colorHex: '#D4AF37', extraCost: '6000' },
      { name: 'Organza Plateada', type: 'ligero', description: 'Organza translúcida con destellos plateados.', colorHex: '#C0C0C0', extraCost: '5000' },
    ],
    products: [
      {
        name: 'Bola Roja Clásica',
        description: 'Esfera tradicional con acabado brillante.',
        basePrice: 18000,
        stock: 40,
        customizable: true,
        sizes: [
          { size: 'S', price: 15000, description: 'Diámetro 6 cm' },
          { size: 'M', price: 18000, description: 'Diámetro 8 cm' },
          { size: 'L', price: 21000, description: 'Diámetro 10 cm' },
        ],
        designs: ['Estrella Dorada', 'Copos de Nieve'],
        fabrics: ['Terciopelo Carmín', 'Satín Dorado'],
      },
      {
        name: 'Bola Cristal Nevado',
        description: 'Bolita transparente con efecto nieve en interior.',
        basePrice: 22000,
        stock: 25,
        customizable: true,
        sizes: [
          { size: 'S', price: 20000, description: 'Diámetro 7 cm' },
          { size: 'M', price: 22000, description: 'Diámetro 9 cm' },
          { size: 'L', price: 25000, description: 'Diámetro 11 cm' },
        ],
        designs: ['Copos de Nieve'],
        fabrics: ['Organza Plateada'],
      },
      {
        name: 'Bola Aurora Boreal',
        description: 'Esfera degradada con tonos verdes y azules.',
        basePrice: 24000,
        stock: 20,
        customizable: true,
        sizes: [
          { size: 'S', price: 22000, description: 'Diámetro 7 cm' },
          { size: 'M', price: 24000, description: 'Diámetro 9 cm' },
          { size: 'L', price: 27000, description: 'Diámetro 11 cm' },
        ],
        designs: ['Estrella Dorada', 'Nochebuena'],
        fabrics: ['Satín Dorado', 'Organza Plateada'],
      },
      {
        name: 'Bola Natural Pino',
        description: 'Esfera revestida en fibras naturales con detalles verdes.',
        basePrice: 20000,
        stock: 30,
        customizable: true,
        sizes: [
          { size: 'S', price: 18000, description: 'Diámetro 6 cm' },
          { size: 'M', price: 20000, description: 'Diámetro 8 cm' },
          { size: 'L', price: 23000, description: 'Diámetro 10 cm' },
        ],
        designs: ['Nochebuena'],
        fabrics: ['Terciopelo Carmín'],
      },
      {
        name: 'Bola Espejo',
        description: 'Acabado espejo para reflejar las luces del árbol.',
        basePrice: 26000,
        stock: 18,
        customizable: true,
        sizes: [
          { size: 'S', price: 24000, description: 'Diámetro 7 cm' },
          { size: 'M', price: 26000, description: 'Diámetro 9 cm' },
          { size: 'L', price: 29000, description: 'Diámetro 11 cm' },
        ],
        designs: ['Estrella Dorada'],
        fabrics: ['Satín Dorado', 'Organza Plateada'],
      },
      {
        name: 'Bola Vintage',
        description: 'Pintada a mano con motivos victorianos.',
        basePrice: 23000,
        stock: 22,
        customizable: true,
        sizes: [
          { size: 'S', price: 21000, description: 'Diámetro 6 cm' },
          { size: 'M', price: 23000, description: 'Diámetro 8 cm' },
          { size: 'L', price: 26000, description: 'Diámetro 10 cm' },
        ],
        designs: ['Nochebuena', 'Copos de Nieve'],
        fabrics: ['Terciopelo Carmín'],
      },
    ],
  },
  {
    slug: 'mono',
    name: 'Moños decorativos',
    description: 'Moños artesanales para regalos y decoración.',
    designs: [
      { name: 'Clásico', description: 'Moño tradicional con doble lazo.', colorHex: '#CC0000', extraCost: '5000' },
      { name: 'Festivo', description: 'Bordes dorados y brillo central.', colorHex: '#E53935', extraCost: '7000' },
      { name: 'Escarchado', description: 'Textura glitter plateada.', colorHex: '#D1D9FF', extraCost: '6000' },
    ],
    fabrics: [
      { name: 'Raso Brillante', type: 'brillante', description: 'Acabado liso y brillante.', colorHex: '#F44336', extraCost: '4000' },
      { name: 'Lino Natural', type: 'natural', description: 'Textura rústica en color neutral.', colorHex: '#C8B89E', extraCost: '3000' },
      { name: 'Gasa Translúcida', type: 'ligero', description: 'Material ligero con transparencia.', colorHex: '#F8E1E1', extraCost: '3500' },
    ],
    products: [
      {
        name: 'Moño Escarlata',
        description: 'Moño rojo intenso ideal para regalos especiales.',
        basePrice: 12000,
        stock: 50,
        customizable: true,
        sizes: [
          { size: 'S', price: 9000, description: 'Ancho 10 cm' },
          { size: 'M', price: 12000, description: 'Ancho 14 cm' },
          { size: 'L', price: 15000, description: 'Ancho 18 cm' },
        ],
        designs: ['Clásico', 'Festivo'],
        fabrics: ['Raso Brillante', 'Gasa Translúcida'],
      },
      {
        name: 'Moño Champagne',
        description: 'Moño color champaña con brillo metálico.',
        basePrice: 14000,
        stock: 35,
        customizable: true,
        sizes: [
          { size: 'S', price: 11000, description: 'Ancho 11 cm' },
          { size: 'M', price: 14000, description: 'Ancho 15 cm' },
          { size: 'L', price: 17000, description: 'Ancho 19 cm' },
        ],
        designs: ['Festivo', 'Escarchado'],
        fabrics: ['Raso Brillante', 'Lino Natural'],
      },
      {
        name: 'Moño Nevado',
        description: 'Moño blanco con textura escarchada.',
        basePrice: 13000,
        stock: 40,
        customizable: true,
        sizes: [
          { size: 'S', price: 10000, description: 'Ancho 9 cm' },
          { size: 'M', price: 13000, description: 'Ancho 13 cm' },
          { size: 'L', price: 16000, description: 'Ancho 17 cm' },
        ],
        designs: ['Escarchado'],
        fabrics: ['Gasa Translúcida', 'Lino Natural'],
      },
    ],
  },
  {
    slug: 'caja',
    name: 'Cajas decorativas',
    description: 'Cajas artesanales listas para envolver regalos.',
    designs: [
      { name: 'Reno', description: 'Ilustración de renos y copos.', colorHex: '#8D6E63', extraCost: '9000' },
      { name: 'Candy Cane', description: 'Rayas rojas y blancas.', colorHex: '#E53935', extraCost: '7000' },
      { name: 'Bosque Invernal', description: 'Paisaje de pinos nevados.', colorHex: '#2E7D32', extraCost: '8000' },
      { name: 'Constelación', description: 'Estrellas doradas sobre fondo azul.', colorHex: '#1E3A8A', extraCost: '8500' },
    ],
    fabrics: [
      { name: 'Papel Kraft', type: 'natural', description: 'Acabado rústico color café.', colorHex: '#BCA48A', extraCost: '2000' },
      { name: 'Cartulina Premium', type: 'premium', description: 'Cartulina rígida satinada.', colorHex: '#F5F5F5', extraCost: '3000' },
      { name: 'Forro Terciopelo', type: 'lujo', description: 'Interior aterciopelado rojo.', colorHex: '#922B21', extraCost: '6000' },
    ],
    products: [
      {
        name: 'Caja Bosque Invernal',
        description: 'Caja con estampado de bosque nevado y lazo verde.',
        basePrice: 28000,
        stock: 25,
        customizable: true,
        sizes: [
          { size: 'S', price: 24000, description: '15 x 15 x 10 cm' },
          { size: 'M', price: 28000, description: '20 x 20 x 12 cm' },
          { size: 'L', price: 32000, description: '25 x 25 x 15 cm' },
        ],
        designs: ['Bosque Invernal', 'Constelación'],
        fabrics: ['Cartulina Premium', 'Forro Terciopelo'],
      },
      {
        name: 'Caja Dulce Nochebuena',
        description: 'Rayas estilo candy cane y detalles dorados.',
        basePrice: 26000,
        stock: 30,
        customizable: true,
        sizes: [
          { size: 'S', price: 22000, description: '18 x 12 x 8 cm' },
          { size: 'M', price: 26000, description: '22 x 16 x 10 cm' },
          { size: 'L', price: 30000, description: '26 x 20 x 12 cm' },
        ],
        designs: ['Candy Cane', 'Reno'],
        fabrics: ['Cartulina Premium'],
      },
      {
        name: 'Caja Estelar',
        description: 'Fondo azul con estrellas doradas y cordón metálico.',
        basePrice: 30000,
        stock: 18,
        customizable: true,
        sizes: [
          { size: 'S', price: 26000, description: '16 x 16 x 10 cm' },
          { size: 'M', price: 30000, description: '21 x 21 x 12 cm' },
          { size: 'L', price: 34000, description: '26 x 26 x 14 cm' },
        ],
        designs: ['Constelación'],
        fabrics: ['Forro Terciopelo', 'Cartulina Premium'],
      },
      {
        name: 'Caja Rústica',
        description: 'Caja kraft con cintas naturales y detalles verdes.',
        basePrice: 24000,
        stock: 35,
        customizable: true,
        sizes: [
          { size: 'S', price: 21000, description: '17 x 13 x 8 cm' },
          { size: 'M', price: 24000, description: '22 x 17 x 10 cm' },
          { size: 'L', price: 28000, description: '27 x 21 x 12 cm' },
        ],
        designs: ['Bosque Invernal', 'Reno'],
        fabrics: ['Papel Kraft'],
      },
    ],
  },
  {
    slug: 'tambor',
    name: 'Tambores decorativos',
    description: 'Mini tambores navideños hechos a mano.',
    designs: [
      { name: 'Percusión Clásica', description: 'Lineas doradas estilo tradicional.', colorHex: '#B8860B', extraCost: '7000' },
      { name: 'Fantasía Invernal', description: 'Copos blancos sobre azul celeste.', colorHex: '#81D4FA', extraCost: '8000' },
      { name: 'Villancico', description: 'Notas musicales en relieve.', colorHex: '#4E342E', extraCost: '7500' },
    ],
    fabrics: [
      { name: 'Cuero Sintético', type: 'premium', description: 'Parche resistente color marfil.', colorHex: '#EEE2C4', extraCost: '5000' },
      { name: 'Cinta Escocesa', type: 'decorativo', description: 'Cinta roja y verde estampada.', colorHex: '#AF1E2D', extraCost: '4500' },
      { name: 'Cordón Dorado', type: 'detalle', description: 'Cordón metálico para bordes.', colorHex: '#B7950B', extraCost: '4000' },
    ],
    products: [
      {
        name: 'Tambor Real',
        description: 'Tambor rojo con detalles dorados y parche marfil.',
        basePrice: 32000,
        stock: 15,
        customizable: true,
        sizes: [
          { size: 'S', price: 29000, description: 'Diámetro 10 cm' },
          { size: 'M', price: 32000, description: 'Diámetro 12 cm' },
          { size: 'L', price: 36000, description: 'Diámetro 14 cm' },
        ],
        designs: ['Percusión Clásica', 'Villancico'],
        fabrics: ['Cuero Sintético', 'Cordón Dorado'],
      },
      {
        name: 'Tambor Invernal',
        description: 'Tambor azul cielo con copos blancos.',
        basePrice: 30000,
        stock: 18,
        customizable: true,
        sizes: [
          { size: 'S', price: 27000, description: 'Diámetro 9 cm' },
          { size: 'M', price: 30000, description: 'Diámetro 11 cm' },
          { size: 'L', price: 34000, description: 'Diámetro 13 cm' },
        ],
        designs: ['Fantasía Invernal'],
        fabrics: ['Cordón Dorado', 'Cinta Escocesa'],
      },
      {
        name: 'Tambor Campanada',
        description: 'Tambor verde con notas musicales doradas.',
        basePrice: 31000,
        stock: 16,
        customizable: true,
        sizes: [
          { size: 'S', price: 28000, description: 'Diámetro 9 cm' },
          { size: 'M', price: 31000, description: 'Diámetro 11 cm' },
          { size: 'L', price: 35000, description: 'Diámetro 13 cm' },
        ],
        designs: ['Villancico', 'Percusión Clásica'],
        fabrics: ['Cinta Escocesa', 'Cuero Sintético'],
      },
    ],
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const dataSource = app.get(DataSource);
    const productRepo = dataSource.getRepository(Product);
    const categoryRepo = dataSource.getRepository(Category);
    const designRepo = dataSource.getRepository(Design);
    const fabricRepo = dataSource.getRepository(Fabric);
    const photoRepo = dataSource.getRepository(Photo);

    console.log('Limpiando datos existentes...');
    await photoRepo.createQueryBuilder().delete().execute();
    await productRepo.createQueryBuilder().delete().execute();
    await designRepo.createQueryBuilder().delete().execute();
    await fabricRepo.createQueryBuilder().delete().execute();

    const categoryMap = new Map<string, Category>();
    const designMap = new Map<string, Design>();
    const fabricMap = new Map<string, Fabric>();

    const targetSlugs = CATEGORIES.map((c) => c.slug);
    const existingCategories = await categoryRepo.find();

    for (const cat of existingCategories) {
      if (!targetSlugs.includes(cat.slug)) {
        await categoryRepo.remove(cat);
      }
    }

    for (const categorySeed of CATEGORIES) {
      const slug = categorySeed.slug;
      let category = await categoryRepo.findOne({
        where: [{ slug }, { name: categorySeed.name }],
      });
      if (!category) {
        category = categoryRepo.create({
          name: categorySeed.name,
          slug,
          description: categorySeed.description,
        });
      } else {
        category.name = categorySeed.name;
        category.slug = slug;
        category.description = categorySeed.description;
      }
      category = await categoryRepo.save(category);
      categoryMap.set(categorySeed.slug, category);

      for (const designSeed of categorySeed.designs) {
        let design = await designRepo.findOne({ where: { name: designSeed.name } });
        if (!design) {
          design = designRepo.create({
            ...designSeed,
            colorHex: designSeed.colorHex?.replace('#', '').toUpperCase(),
            category,
          });
        } else {
          Object.assign(design, {
            description: designSeed.description,
            colorHex: designSeed.colorHex?.replace('#', '').toUpperCase(),
            extraCost: designSeed.extraCost,
            category,
          });
        }
        design = await designRepo.save(design);
        designMap.set(designSeed.name, design);
      }

      for (const fabricSeed of categorySeed.fabrics) {
        let fabric = await fabricRepo.findOne({ where: { name: fabricSeed.name } });
        if (!fabric) {
          fabric = fabricRepo.create({
            ...fabricSeed,
            colorHex: fabricSeed.colorHex?.replace('#', '').toUpperCase(),
          });
        } else {
          Object.assign(fabric, {
            type: fabricSeed.type,
            description: fabricSeed.description,
            colorHex: fabricSeed.colorHex?.replace('#', '').toUpperCase(),
            extraCost: fabricSeed.extraCost,
          });
        }
        fabric = await fabricRepo.save(fabric);
        fabricMap.set(fabricSeed.name, fabric);
      }
    }

    for (const categorySeed of CATEGORIES) {
      const category = categoryMap.get(categorySeed.slug)!;

      for (const productSeed of categorySeed.products) {
        const product = productRepo.create({
          name: productSeed.name,
          description: productSeed.description,
          basePrice: productSeed.basePrice.toFixed(2),
          stock: productSeed.stock,
          customizable: productSeed.customizable,
          sizes: productSeed.sizes,
          category,
        });

        let saved = await productRepo.save(product);

        const designs = (productSeed.designs ?? [])
          .map((name) => designMap.get(name))
          .filter((d): d is Design => Boolean(d));
        const fabrics = (productSeed.fabrics ?? [])
          .map((name) => fabricMap.get(name))
          .filter((f): f is Fabric => Boolean(f));

        saved.designs = designs;
        saved.fabrics = fabrics;
        saved = await productRepo.save(saved);
        console.log(`Producto creado: ${saved.name}`);
      }
    }

    console.log('Seed de productos completado.');
  } catch (error) {
    console.error('Error ejecutando seed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
    process.exit(process.exitCode ?? 0);
  }
}

bootstrap();
