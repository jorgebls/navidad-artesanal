
# 🎄 Navidad Artesanal

Aplicación web para la venta de artículos navideños artesanales (bolitas, moños, cajas, tambores).  
Proyecto universitario desarrollado en **Angular**.

---

## Requisitos previos

* **Windows 10/11** con acceso a **Microsoft Store** para tener **App Installer** (que trae `winget`).
  Si `winget` no existe, abre Microsoft Store → busca **App Installer** → **Instalar** / **Actualizar**.
* **PowerShell** (puedes usarlo en modo usuario; para instalar con winget a veces verás un prompt pidiendo elevación).

---

## Pasos

### 1) Verificar `winget`

```powershell
winget --version
```

**Qué hace:** Muestra la versión de Windows Package Manager. Si aparece un error, instala/actualiza **App Installer** desde Microsoft Store.

---

### 2) Instalar Node.js LTS (incluye npm)

```powershell
winget install --id OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements
```

**Qué hace:** Descarga e instala la versión LTS de Node.js. Incluye **npm** (el gestor de paquetes de Node).

> Si al final de la instalación `node`/`npm` “no se reconocen”, cierra y vuelve a abrir PowerShell (se refresca el **PATH**).

---

### 3) Verificar Node

```powershell
node -v
```

**Qué hace:** Imprime la versión de Node (por ejemplo `v22.20.0`), confirmando que quedó instalado y en el PATH.

---

### 4) Verificar npm

```powershell
npm -v
```

**Qué hace:** Imprime la versión de npm (por ejemplo `10.x`).
**Si ves un error de políticas de PowerShell (ExecutionPolicy):** usa `npm.cmd -v` (y en adelante **`npm.cmd`** en lugar de `npm`).

---

### 5) Instalar Git

```powershell
winget install --id Git.Git --source winget --accept-package-agreements --accept-source-agreements
```

**Qué hace:** Instala Git para clonar y trabajar con repositorios.

---

### 6) Verificar Git

```powershell
git --version
```

**Qué hace:** Muestra la versión de Git para confirmar instalación y PATH.

> **Nota:** usa `--version` (dos guiones). Si pones `–version` (guion largo), fallará.

---

### 7) Ubícate en la carpeta donde quieres clonar el repo

```powershell
cd C:\Users\TU_USUARIO\Videos\PWeb
```

**Qué hace:** Cambia al directorio donde quedará la carpeta del proyecto al clonar.
*(Puedes usar cualquier ruta de tu preferencia.)*

---

### 8) Clonar el repositorio

```powershell
git clone https://github.com/jorgebls/navidad-artesanal.git
```

**Qué hace:** Descarga el código fuente a una carpeta local llamada `navidad-artesanal`.

---

### 9) Entrar al repositorio

```powershell
cd navidad-artesanal
```

**Qué hace:** Te ubica dentro de la carpeta del proyecto recién clonada.

---

### 10) Cambiar a la rama de trabajo

```powershell
git checkout segunda_entrega
```

**Qué hace:** Cambia a la rama `segunda_entrega`, donde está el código que necesitas correr.

---

### 11) Traer los últimos cambios de la rama remota(opcional)

```powershell
git pull origin segunda_entrega
```

**Qué hace:** Actualiza tu copia local con los cambios más recientes del remoto (`origin`).

---

### 12) Entrar a la carpeta del frontend 

```powershell
cd web
```

**Qué hace:** Entra al subdirectorio donde vive el proyecto de la web 

---

### 13) Instalar dependencias

```powershell
npm.cmd install
```

**Qué hace:** Descarga e instala las dependencias listadas en `package.json`.

> Usamos **`npm.cmd`** para evitar bloqueos de scripts en PowerShell (ExecutionPolicy). En **CMD** bastaría con `npm install`.

---

### 14) Iniciar la app

```powershell
npm.cmd start
```

**Qué hace:** Ejecuta el script `start` definido en `package.json` (por ejemplo: `ng serve --open` en Angular, o `vite`/`webpack` en otros stacks).
La terminal mostrará la **URL local** (p. ej., `http://localhost:4200` o similar).

---

### 15) Abrir en el navegador

Copia y pega la **URL que muestra la terminal** (por ejemplo, `http://localhost:4200`) en tu navegador para visualizar la app.


⸻

🛠️ **Funcionalidades actuales**

* **Home** con sección *hero* y acceso directo al catálogo.
* **Catálogo de productos** (datos semilla desde **JSON**).
* **Detalle de producto** con información ampliada.
* **Carrito funcional**:

  * Añadir productos desde catálogo/detalle
  * Incrementar/decrementar cantidades
  * Eliminar ítems y **vaciar carrito**
  * **Subtotal y total en tiempo real**
  * **Persistencia en localStorage** (se mantiene entre recargas)
* **Autenticación básica**: Login, Registro y Perfil.
* **Header dinámico** según estado de sesión (mostrar/ocultar acciones).
* **Ruteo principal**: `/` (home), `/catalogo`, `/producto/:id`, `/carrito`, `/login`, `/registro`, `/perfil`,`personalizar`.


⸻

📌 Notas
	•	Proyecto probado en macOS y Windows.
	•	Para cualquier error en dependencias, eliminar la carpeta node_modules/ y correr npm install de nuevo.
	•	Las imágenes y datos de ejemplo están en la carpeta public/assets/.

