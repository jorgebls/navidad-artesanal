# Documentación del proyecto (navidad artesanal)

## 1. Objetivo y funcionamiento general
**Objetivo.** Navidad Artesanal es una tienda en línea que exhibe un catálogo de productos navideños hechos a mano, permite autenticarse (registro/login demo), gestionar un carrito local y simula el flujo de checkout invitando al usuario a iniciar sesión.

**Flujos implementados actualmente**
- **Navegación pública:** La cabecera (`HeaderComponent`) muestra enlaces contextuales a catálogo, personalización y carrito, con badges de cantidad y estado de sesión; el home presenta la propuesta de valor, CTA al catálogo, bloques de categorías y destacados, además de un formulario de suscripción que valida el formato del correo, despliega mensajes temporales y limpia el campo automáticamente.
- **Catálogo y descubrimiento:** `CatalogComponent` asegura que el seed del catálogo se ejecute antes de renderizar, obtiene los productos normalizados desde `ProductsService`, maneja errores de imagen y expone precios por talla predeterminada; cada tarjeta navega al detalle del producto, permitiendo un flujo de exploración completo desde `/catalogo`.
- **Detalle de producto y selección:** `ProductDetailComponent` recupera el identificador desde la ruta, carga el producto y determina la talla inicial observando el carrito existente; el usuario puede alternar tallas, ver cómo cambian precio, descripción e imagen, ajustar la cantidad y añadir al carrito, tras lo cual el componente confirma que el ítem quedó almacenado y ofrece ir directamente al carrito.
- **Gestión de carrito y pre-checkout:** `CartComponent` se suscribe a la signal reactiva de `CartService`, renderiza el listado con controles por ítem (cambiar cantidad, eliminar) y actualiza los totales de manera inmediata; también permite vaciar el carrito completo y, al iniciar el checkout, abre un modal que resume el requisito de autenticación y dirige a login o registro, manteniendo la intención de compra.
- **Autenticación demo y perfil:** Los formularios de registro e inicio de sesión están construidos con `ReactiveFormsModule`, incluyen validaciones por campo, mensajes de error contextuales y, al enviar, interactúan con `AuthService` para persistir usuarios y sesiones en `localStorage`; el perfil muestra los datos capturados, expone la opción de cerrar sesión y sincroniza la cabecera para reflejar el estado actual.
- **Persistencia y estado compartido:** `StorageService` centraliza el acceso a `localStorage`, permitiendo que `ProductsService`, `CartService` y `AuthService` compartan datos; el estado del carrito utiliza *signals* para publicar cambios en tiempo real hacia cabecera, detalle y carrito, asegurando una experiencia consistente entre páginas.

**Flujos pendientes para la entrega final**
- **Checkout real:** Implementar proceso de pago/confirmación posterior al modal actual, incluyendo validación de dirección, resumen de pedido y generación de órdenes.
- **Personalización de productos:** Completar la experiencia de `/personalizar` (actualmente página informativa) con configuradores de materiales/colores y lógica correspondiente.
- **Sincronización con backend:** Sustituir almacenamiento en `localStorage` por API real para usuarios, catálogo y carrito, incluyendo `CartService.syncWithUser`.
- **Seguridad de credenciales:** Reemplazar el hash Base64 por un mecanismo seguro y manejo de sesiones/token.
- **Gestión avanzada de inventario y promociones:** Integrar reglas de stock, precios dinámicos o contenidos adicionales según se defina en el alcance final.

## 2. Arquitectura funcional resumida

### 2.1 Servicios y almacenamiento
- `StorageService`: wrapper de `localStorage` para serializar/leer JSON.
- `ProductsService`: siembra catálogo desde `assets/data/products.json`, normaliza variantes y entrega datos a las vistas.
- `CartService`: usa *signals* para manejar ítems, total, conteo y persistencia en `NA_CART`.
- `AuthService`: gestiona usuarios de demostración (`NA_USERS`), registro, login, logout y expone el usuario actual.

### 2.2 Componentes compartidos
- `AppComponent`: inyecta `ProductsService.seedIfEmpty()`, renderiza cabecera, contenido y pie.
- `HeaderComponent`: navegación principal, badge de carrito y control de sesión.
- `FooterComponent`: información institucional.
- `SnowEffectComponent`: efecto visual de nieve controlado por DOM.

### 2.3 Páginas clave
- `HomeComponent`: hero, categorías, productos destacados y suscripción.
- `CatalogComponent`: grilla de productos con precio por talla `M` y fallback de imagen.
- `ProductDetailComponent`: selector de talla/cantidad e integración con carrito.
- `CartComponent`: CRUD de ítems, cálculo de totales y modal de checkout simulado.
- `RegisterComponent` / `LoginComponent`: formularios con validaciones reactivas, conexión a `AuthService` y redirecciones.
- `ProfileComponent`: muestra datos persistidos y permite logout.
- `CustomizeComponent`: placeholder para futura experiencia de personalización.

## 3. Instrucciones para ejecutar el proyecto
Para ejecutar la aplicación (instalación de dependencias, scripts de desarrollo y build) consulta las instrucciones del archivo `README.md` ubicado en la carpeta `web/`.

## 4. Aclaraciones y observaciones
- El proyecto se apoya en `localStorage`; al limpiar el almacenamiento del navegador se pierden usuarios, carrito y catálogo sembrado.
- Las credenciales se almacenan con hashing Base64 solo para demostración y deben endurecerse en el siguiente hito.
- `ProductsService.seedIfEmpty()` depende de `assets/data/products.json`; cualquier cambio en el catálogo debe reflejarse en ese archivo.
- `SnowEffectComponent` manipula el DOM directamente; si se amplía el efecto conviene revisar rendimiento y accesibilidad.
- El modal de checkout no procesa pagos reales. Definir pronto los requisitos funcionales para integrarlo con el backend antes de la entrega final.

---
#modelo datos





---
#link del video mostrando la aplicacion 

https://youtu.be/r9gEPz6a5xQ

