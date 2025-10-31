# Documentación funcional – Navidad Artesanal

## 1. Objetivo general
Navidad Artesanal es una plataforma web que permite descubrir, personalizar y comprar productos navideños hechos a mano. Incluye un backend en NestJS que expone la API REST y un frontend en Angular que ofrece la experiencia visual para clientes finales.

## 2. Flujos funcionales principales
- **Autenticación y sesión:** registro e inicio de sesión con validaciones completas, emisión de token JWT válido por 1 hora y reconstrucción de sesión con `/api/auth/me`. En el frontend un servicio de timeout cierra la sesión tras 15 min sin actividad.
- **Catálogo y descubrimiento:** navegación pública por categorías, filtros básicos y búsqueda; los listados usan precios por variante (talla) y muestran imágenes firmadas desde Supabase.
- **Detalle y personalización:** para productos personalizables se seleccionan talla, diseño y tela, calculando el precio final; la vista maneja faltantes y contenidos alternativos.
- **Carrito y checkout:** el carrito usa signals para reaccionar en tiempo real. El checkout requiere autenticación, solicita datos de envío y crea la orden en el backend.
- **Gestión de pedidos:** el backend valida ciudad/departamento, crea los ítems, asigna estado inicial y permite cancelar mientras el pedido está “En proceso”; el frontend muestra el resumen tras la compra.
- **Perfil y actualización de datos:** el usuario autenticado puede consultar y editar sus datos personales. Las restricciones impiden duplicar correos y protegen la contraseña.

## 3. Arquitectura de la solución

### 3.1 Backend (carpeta `api/`)
- **Framework:** NestJS con TypeScript.
- **Bootstrapping (`src/main.ts`):** define prefijo global `/api`, habilita `ValidationPipe` con `whitelist`, `forbidNonWhitelisted` y conversión de tipos, y levanta el servidor en el puerto 3000.
- **Módulo raíz (`src/app.module.ts`):** carga `ConfigModule`, configura `TypeOrmModule.forRootAsync` para PostgreSQL (SSL permisivo, `autoLoadEntities`, `synchronize` para desarrollo) y registra los módulos funcionales.
- **Módulos destacados:**
  - `auth`: manejo de registro, login, refresco de perfil, generación/validación de tokens JWT (`JwtModule`, `JwtStrategy`, `JwtAuthGuard`).
  - `user`: CRUD básico de usuarios con sanitización de datos y hash de contraseña (`bcrypt`).
  - `product`, `category`, `design`, `fabric`, `size`: definen catálogo, relaciones Many-to-Many y variantes (tallas, diseños, telas).
  - `photo`: guarda metadatos de imágenes y firma URLs mediante Supabase Storage.
  - `order`: crea y lista pedidos, valida consistencia de ubicación, controla estados y cancelaciones.
  - `location`: expone catálogos de departamentos y ciudades.
- **Seguridad:** rutas críticas usan `@UseGuards(JwtAuthGuard)`, que verifica el token y adjunta `{ userId, email }` en `req.user`. Se emplean excepciones HTTP estándar (`UnauthorizedException`, `ConflictException`, etc.).
- **Integraciones:** Supabase Storage para imágenes, PostgreSQL como base de datos, `bcrypt` para hashes.

### 3.2 Frontend (carpeta `web/`)
- **Framework:** Angular standalone con TypeScript, router y signals.
- **Estructura:** `app/` se divide en `core` (servicios), `shared` (componentes y modelos reutilizables) y `pages` (rutas lazy). `app.routes.ts` define las pantallas y protege `checkout` y `perfil` con `authGuard`.
- **Gestión de estado:** `AuthService`, `CartService` y otros servicios usan signals para exponer estado reactivo. `StorageService` sincroniza con `localStorage`.
- **Servicios clave:**
  - `AuthService`: login/registro contra `/api/auth`, persistencia de token, refresco de perfil y actualización de datos.
  - `ProductsService`, `CategoryService`, `CustomizationService`: consumen la API para catálogo y personalización.
  - `OrderService`: envía pedidos al backend y gestiona la respuesta.
  - `SessionTimeoutService`: registra actividad de usuario y cierra sesión tras 15 min sin interacción, redirigiendo al login.
- **Interfaz:** componentes compartidos (`Header`, `Footer`, `SnowEffect`) envuelven a las páginas; formularios reactivos en autenticación y checkout validan datos antes de llamar a la API.

### 3.3 Comunicación front ↔ back
- La API expone rutas bajo `/api/...`; el front se comunica vía `HttpClient` con un proxy local (`proxy.conf.json`) durante desarrollo.
- Las rutas protegidas requieren header `Authorization: Bearer <token>`. El guard de Angular (`authGuard`) bloquea la navegación en el cliente y el guard de Nest valida el token en el servidor.
- Supabase entrega URLs firmadas con vigencia de 1 hora, que el frontend usa para renderizar imágenes.

## 4. Modelo de datos principal
- **User:** datos personales, correo único, teléfono, documento y `passwordHash` (UUID como PK, `CreateDateColumn`).
- **Product:** información base, precio, stock, indicador `customizable`, relaciones con fotos, categoría, diseños, telas y variantes de talla (JSONB).
- **Category:** nombre, slug y relación con tallas (`size`).
- **Design / Fabric:** catálogos con costo extra opcional, color, imagen y vínculo Many-to-Many con productos.
- **Photo:** metadatos de archivo ligado al producto.
- **Order / OrderItem / OrderStatus:** pedidos con total, método de pago, relación a usuario y colección de items; los estados se precargan (“En proceso”, “Completado”, “Cancelado”).
- **Department / City:** tablas maestras para validar ubicación en el checkout.

## 5. Integraciones y configuración
- **PostgreSQL:** conexión parametrizada mediante variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- **Supabase Storage:** requiere `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE` y `SUPABASE_BUCKET`; se usa para almacenar y firmar imágenes de productos.
- **JWT:** `JWT_SECRET` define la clave de firma y la caducidad se fija en 1 hora desde `AuthModule`.
- Los valores se declaran en `api/.env`. El frontend usa `proxy.conf.json` para redirigir `/api` al backend en desarrollo.

## 6. Ejecución local
1. **Backend**
   1. `cd api`
   2. `npm install`
   3. Completar `api/.env` con las variables necesarias.
   4. `npm run start:dev`
2. **Frontend**
   1. `cd web`
   2. `npm install`
   3. `npm run start` (utiliza el proxy para apuntar al backend en `http://localhost:3000`).

## 7. Consideraciones y próximos pasos
- Los tokens expiran a la hora y requieren reautenticación; evaluar refresh tokens para sesiones más largas.
- El timeout de 15 min de inactividad se gestiona en el frontend; no existe invalidación de sesión en el backend.
- Faltan integrar pagos reales y reforzar manejo de stock simultáneo.
- Migrar `synchronize: true` a migraciones controladas antes del despliegue productivo.
- Añadir pruebas automatizadas para módulos críticos (auth, pedidos, catálogo).

## 8. Recursos y evidencias
- **Video demostrativo:** https://youtu.be/r9gEPz6a5xQ

