# Benix

Sistema de gestión para agencias de marketing y creadores de contenido. Centraliza clientes, calendario de publicaciones, contabilidad, creación de contenido, mapas mentales y bóveda de contraseñas en una sola aplicación web que funciona completamente sin conexión a servidores externos.

---

## Índice

- [Descripción general](#descripción-general)
- [Tecnologías](#tecnologías)
- [Instalación y uso](#instalación-y-uso)
- [Autenticación](#autenticación)
- [Módulos](#módulos)
  - [Dashboard](#dashboard)
  - [Clientes](#clientes)
  - [Calendario de Contenido](#calendario-de-contenido)
  - [Contabilidad](#contabilidad)
  - [Mapa Mental](#mapa-mental)
  - [Bóveda de Claves](#bóveda-de-claves)
  - [Creación de Contenido](#creación-de-contenido)
  - [Ajustes](#ajustes)
- [Almacenamiento de datos](#almacenamiento-de-datos)
- [Roles de usuario](#roles-de-usuario)
- [Temas visuales](#temas-visuales)

---

## Descripción general

Benix es una SPA (Single Page Application) construida con React y compilada como un único archivo HTML autocontenido. Esto significa que no requiere servidor, base de datos ni conexión a internet para funcionar: toda la información se guarda en el `localStorage` del navegador del equipo donde se ejecuta.

Está pensada para agencias pequeñas o freelancers de marketing digital que necesiten gestionar múltiples clientes, planificar contenido, llevar un registro contable básico y administrar credenciales de plataformas sociales, todo desde un mismo lugar.

---

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3 | UI y estado de la aplicación |
| React Router DOM | 6.26 | Navegación entre módulos |
| Vite | 5.4 | Bundler y servidor de desarrollo |
| vite-plugin-singlefile | 2.3 | Compilación en un único `.html` portable |

No utiliza ninguna librería de componentes externa ni dependencias de servidor. Todo el CSS está escrito a mano con variables CSS para theming.

---

## Instalación y uso

### Requisitos

- Node.js 18 o superior
- npm

### Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# La app queda disponible en http://localhost:5173
```

**Atajo en Mac:** Doble clic en `Iniciar Benix.command` para abrir automáticamente el navegador y arrancar el servidor.

### Compilación para distribución

```bash
npm run build
```

Genera `dist/index.html`, un único archivo HTML con todo el JavaScript y CSS embebido. Se puede copiar a cualquier equipo y abrirse directamente en el navegador sin instalar nada.

---

## Autenticación

Al iniciar la aplicación, el usuario es dirigido a la pantalla de login.

**Credenciales por defecto:**

| Campo | Valor |
|---|---|
| Usuario | `gmellado` |
| Contraseña | `gmellado1988x` |

El sistema de autenticación almacena la sesión en `localStorage` bajo la clave `benix_session`. Al cerrar y reabrir el navegador, si la sesión sigue activa, el usuario es redirigido directamente al Dashboard sin necesidad de iniciar sesión nuevamente.

**Flujo de login:**
1. El usuario ingresa usuario y contraseña.
2. Se busca coincidencia en la lista de usuarios guardados en `localStorage`.
3. Si es válido, se guarda la sesión (sin la contraseña) y se redirige al Dashboard.
4. Si es inválido, se muestra un mensaje de error con animación de sacudida.

**Cierre de sesión:** Disponible desde la barra lateral. Elimina la clave `benix_session` del `localStorage`.

---

## Módulos

### Dashboard

**Ruta:** `/dashboard`

Vista general de la actividad de la agencia con widgets informativos:

- **Widget de Instagram:** Muestra métricas simuladas de seguidores, alcance y engagement. Funciona como panel de referencia visual.
- **Widget de TikTok:** Muestra datos de vistas, seguidores y rendimiento de videos.
- **Widget de Meta:** Resumen del rendimiento de campañas en Meta Business (Facebook/Instagram Ads).
- **Widget de Calendario:** Vista compacta del mes actual con indicadores de posts programados.
- **Widget de Reuniones:** Lista de próximas reuniones o tareas del día.

El Dashboard no requiere interacción directa. Es un punto de entrada visual para tener un panorama rápido del estado del trabajo.

---

### Clientes

**Ruta:** `/clients`

Gestión completa de la cartera de clientes.

**Campos por cliente:**
- Nombre (requerido)
- Empresa
- Email
- Teléfono
- Sitio web
- Estado (`Activo` / `Inactivo`)
- Notas
- Fecha de incorporación

**Acciones disponibles:**

| Acción | Cómo realizarla |
|---|---|
| Crear cliente | Botón `+ Nuevo Cliente` en la parte superior derecha |
| Ver detalle | Clic sobre la tarjeta del cliente |
| Editar | Desde el modal de detalle, botón `Editar` |
| Eliminar | Desde el modal de detalle, botón `Eliminar` (pide confirmación) |
| Buscar | Campo de búsqueda que filtra por nombre, empresa o email en tiempo real |
| Filtrar por estado | Botones `Todos`, `Activo`, `Inactivo` |

**Visualización:** Los clientes se muestran en una grilla de tarjetas. Cada tarjeta muestra un avatar con las iniciales del nombre (con color asignado automáticamente), empresa, email, teléfono y fecha de incorporación.

**Persistencia:** Los datos se guardan en `localStorage` bajo la clave `benix_clients`.

---

### Calendario de Contenido

**Ruta:** `/calendar`

Planificador visual de publicaciones en formato calendario mensual.

**Vista del calendario:**
- Muestra el mes completo con los días de la semana (L–D).
- Cada día puede tener uno o más posts programados.
- Los posts aparecen como badges de color dentro del día, con el nombre del cliente truncado.
- Si hay más de 3 posts en un día, se muestra `+N más`.
- El día actual se resalta visualmente.

**Navegación:**
- Flechas `←` `→` para moverse entre meses.
- Botón `Hoy` para volver al mes actual.

**Campos de cada post:**
- Nombre del cliente (requerido)
- Formato: `Carrusel`, `Imagen`, `Reel`
- Estado: `Sin Empezar`, `En Curso`, `Listo`, `Publicado`
- Fecha de publicación
- Copy del post (con selector de emojis)
- Archivos adjuntos (imágenes, videos, documentos)

**Estados y colores de badge:**

| Estado | Color |
|---|---|
| Sin Empezar | Gris |
| En Curso | Azul |
| Listo | Verde |
| Publicado | Morado |

**Acciones disponibles:**

| Acción | Cómo realizarla |
|---|---|
| Agregar post | Clic en cualquier día del calendario o botón `+ Agregar Post` |
| Editar post | Clic sobre el badge del post en el calendario |
| Eliminar post | Desde el modal de edición, botón `Eliminar` (pide confirmación) |
| Insertar emoji | Botón 😊 junto al campo de copy; abre un panel con 30 emojis |
| Adjuntar archivos | Zona de drag & drop o clic para seleccionar archivos |

**Persistencia:** Los datos se guardan en `localStorage` bajo la clave `benix_posts`.

---

### Contabilidad

**Ruta:** `/accounting`

Registro de ingresos y egresos con resumen mensual y exportación a CSV.

**Tarjetas de resumen (parte superior):**
- **Ingresos del mes:** Suma total de transacciones tipo `Ingreso` del período seleccionado.
- **Egresos del mes:** Suma total de transacciones tipo `Egreso`.
- **Balance neto:** Diferencia entre ingresos y egresos (verde si positivo, rojo si negativo).
- **Pendiente de cobro:** Suma de transacciones con estado `Pendiente`.

**Gráfico de barras:** Muestra visualmente las primeras 8 transacciones del mes filtrado con barras proporcionales a su monto. Ingresos en verde, egresos en rojo.

**Campos de cada transacción:**
- Fecha (requerida)
- Descripción (requerida)
- Categoría: `Ingreso` / `Egreso`
- Monto en CLP (requerido)
- Estado: `Pagado` / `Pendiente`
- Cliente (opcional)
- Notas

**Filtros disponibles:**
- Selector de mes (Enero–Diciembre)
- Selector de año (2024–2026)
- Botones `Todos`, `Ingreso`, `Egreso`

**Acciones disponibles:**

| Acción | Cómo realizarla |
|---|---|
| Nueva transacción | Botón `+ Nueva Transacción` |
| Editar transacción | Botón ✎ en la fila de la tabla |
| Eliminar transacción | Botón ✕ en la fila de la tabla (pide confirmación) |
| Exportar a CSV | Botón `↓ Exportar CSV`; descarga el período filtrado con columnas: Fecha, Descripción, Categoría, Monto, Cliente, Estado |

**Datos de ejemplo:** Al abrir por primera vez, el módulo carga 4 transacciones de ejemplo para el mes actual, lo que permite explorar la interfaz sin necesidad de cargar datos manualmente.

**Persistencia:** Los datos se guardan en `localStorage` bajo la clave `benix_transactions`.

---

### Mapa Mental

**Ruta:** `/mindmap`

Canvas interactivo para visualizar y conectar ideas en forma de grafo.

**Nodos:**
- Cada nodo representa una idea con título, estado y color.
- Los nodos se pueden arrastrar libremente por el canvas.
- Al hacer clic derecho sobre un nodo, aparece un menú contextual con las opciones `Editar`, `Eliminar` y `Conectar`.

**Conexiones entre nodos:**
- Las conexiones se visualizan como líneas curvas (curvas de Bézier) con un punto de acción en el centro.
- Al hacer clic sobre el punto central de una conexión, se abre un panel lateral de **análisis en conjunto**, donde se puede escribir notas sobre la relación entre los dos nodos conectados.
- Al editar un nodo, aparece una sección `Conectar con...` que lista los demás nodos con checkboxes para activar o desactivar conexiones.

**Campos de cada nodo:**
- Nombre/título (requerido)
- Estado: `Sin Empezar`, `En Curso`, `Listo`
- Color: Azul, Verde, Morado, Naranja, Rojo

**Zoom:**
- Botones `+` y `−` para acercar/alejar (rango: 30%–200%).
- Botón `Reset` para volver al 100%.
- El porcentaje de zoom actual se muestra entre los botones.

**Acciones disponibles:**

| Acción | Cómo realizarla |
|---|---|
| Crear nodo | Botón `+ Nueva Idea` |
| Mover nodo | Arrastrar con el mouse |
| Editar nodo | Clic derecho → `Editar`, o desde el modal |
| Eliminar nodo | Clic derecho → `Eliminar` |
| Conectar nodos | Editar un nodo → sección `Conectar con...` |
| Analizar conexión | Clic en el punto ⬡ central de una línea de conexión |

**Persistencia:** Los nodos se guardan en `localStorage` bajo la clave `benix_mind_nodes`. Las posiciones se actualizan automáticamente al soltar un nodo después de arrastrarlo.

---

### Bóveda de Claves

**Ruta:** `/vault`

Gestor de contraseñas protegido con una capa de autenticación adicional.

**Autenticación de la bóveda:**
Antes de acceder al contenido, se solicita usuario y contraseña propios de la bóveda (independientes del login principal de la app). Si las credenciales son incorrectas, el formulario muestra una animación de sacudida y un mensaje de error. Si son correctas, se muestra el contenido de la bóveda.

**Tabla de cuentas:**
Muestra todas las credenciales guardadas con columnas:
- Plataforma (con ícono generado desde la primera letra)
- Usuario (con botón de copiar al portapapeles)
- Contraseña (oculta por defecto, con botón para mostrar/ocultar y botón de copiar)
- URL (enlace clickeable que abre en nueva pestaña)
- Acciones (editar / eliminar con confirmación)

**Panel lateral de detalle:**
Al hacer clic en una fila de la tabla, se despliega un panel lateral derecho con:
- Nombre e icono de la plataforma
- Notas asociadas a la cuenta
- Historial de comentarios (con timestamp)
- Campo para agregar nuevos comentarios (Enter o botón `+`)

**Campos de cada cuenta:**
- Plataforma (requerida)
- Usuario (requerido)
- Contraseña
- URL
- Notas

**Seguridad de almacenamiento:** Las contraseñas se guardan en `localStorage` codificadas en Base64. Esta codificación **no es cifrado** y no debe considerarse segura ante acceso físico al equipo; sirve para evitar exposición visual accidental.

**Persistencia:** Las cuentas se guardan en `benix_vault` y los comentarios en `benix_vault_comments`.

---

### Creación de Contenido

**Ruta:** `/content`

Espacio de trabajo para redactar, organizar y hacer seguimiento de piezas de contenido para redes sociales y blogs.

**Vistas disponibles:**

- **Kanban:** Tres columnas (`Pendiente`, `En Curso`, `Listo`) con tarjetas de contenido. Cada tarjeta muestra la plataforma, título, extracto del copy, fecha de publicación y número de archivos adjuntos. Al hacer clic en una tarjeta, se abre el modal de edición.
- **Tabla:** Lista tabular con columnas de título, plataforma, estado, fecha de publicación y archivos. Clic en fila para editar.

Se alterna entre vistas con los botones `■ Kanban` y `≡ Tabla` en la cabecera.

**Plataformas soportadas:** Instagram, TikTok, YouTube, Blog, Otros.

**Campos de cada pieza de contenido:**
- Título (requerido)
- Plataforma
- Estado: `Pendiente`, `En Curso`, `Listo`
- Fecha de creación (automática, de solo lectura)
- Fecha de publicación
- Copy / Desarrollo (área de texto extendida)
- Notas internas
- Archivos adjuntos

**Funcionalidades del campo Copy:**

| Función | Cómo usarla |
|---|---|
| Emojis | Botón 😊 abre un selector con 20 emojis frecuentes |
| Nota de voz | Botón 🎤 activa el reconocimiento de voz del navegador (español chileno). Transcribe lo que el usuario dice y lo inserta al final del copy |
| Adjuntar archivos | Zona de drag & drop; acepta imágenes, videos, documentos y audio |

**Nota de voz:** Usa la Web Speech API del navegador (`SpeechRecognition`). Requiere permiso de micrófono. Solo funciona en navegadores compatibles (Chrome, Edge). El idioma configurado es `es-CL`.

**Persistencia:** Los datos se guardan en `localStorage` bajo la clave `benix_content`.

---

### Ajustes

**Ruta:** `/settings`

Panel de configuración dividido en cuatro pestañas:

#### Perfil

- **Información del perfil:** Edición del nombre de visualización, email y color del avatar (6 opciones de color). El avatar muestra las iniciales del nombre.
- **Cambiar contraseña:** Formulario de tres campos (contraseña actual, nueva contraseña, confirmación). Valida que la contraseña actual sea correcta, que la nueva tenga al menos 6 caracteres y que coincida con la confirmación.

#### Conexiones

Panel de integración con plataformas externas. Las conexiones disponibles son:

| Plataforma | Campos requeridos |
|---|---|
| Instagram | Usuario |
| TikTok | Usuario |
| Meta Business | Business Account ID + Access Token |
| Google Calendar | Email de Google |

Al conectar una plataforma, se guarda la información en `localStorage` y el estado cambia a `● Conectado`. Se puede desconectar con el botón `Desconectar`.

> **Nota:** Las conexiones actuales son de demostración. En producción se utilizaría OAuth para autenticación segura con cada plataforma.

#### Usuarios

Administración de los usuarios que pueden acceder a Benix.

- Lista de todos los usuarios con nombre, rol y fecha de creación.
- Botón `+ Nuevo Usuario` para crear usuarios adicionales.
- Cada usuario puede ser eliminado (excepto el propio usuario activo).
- Los roles disponibles son: `Super Admin`, `Editor`, `Viewer`.

**Crear usuario:** Se requiere nombre de usuario, contraseña y rol. El usuario queda disponible para iniciar sesión inmediatamente.

#### Apariencia

- Selector de tema: `Claro` ☀ / `Oscuro` ☽. El tema se aplica instantáneamente mediante el atributo `data-theme` en el `<html>` y se persiste en `localStorage`.
- Información del sistema: versión, desarrollador, tipo de almacenamiento.

---

## Almacenamiento de datos

Toda la información de Benix se guarda en el `localStorage` del navegador. Las claves utilizadas son:

| Clave | Contenido |
|---|---|
| `benix_users` | Lista de usuarios del sistema |
| `benix_session` | Sesión activa del usuario (sin contraseña) |
| `benix_clients` | Cartera de clientes |
| `benix_posts` | Posts del calendario de contenido |
| `benix_transactions` | Transacciones contables |
| `benix_mind_nodes` | Nodos del mapa mental |
| `benix_vault` | Credenciales de la bóveda (contraseñas en Base64) |
| `benix_vault_comments` | Comentarios asociados a cuentas de la bóveda |
| `benix_content` | Piezas de contenido en creación |
| `benix_settings` | Configuraciones de la app (tema, conexiones) |

**Importante:** Al limpiar el `localStorage` del navegador o usar el modo incógnito, todos los datos se pierden. Se recomienda realizar backups periódicos exportando los datos en CSV (disponible en Contabilidad) o haciendo una copia manual del `localStorage` para módulos sin exportación.

---

## Roles de usuario

| Rol | Descripción |
|---|---|
| `superadmin` | Acceso total. Puede gestionar usuarios y todas las funciones. |
| `Editor` | Puede crear y editar contenido. |
| `Viewer` | Solo lectura (visualización). |

Los roles están definidos en el sistema de autenticación pero la restricción de acceso por rol en la interfaz es configurable según las necesidades del equipo.

---

## Temas visuales

Benix soporta modo claro y modo oscuro. El tema se controla desde **Ajustes → Apariencia**.

El sistema usa variables CSS globales (`--cream`, `--dark`, `--blue`, `--accent`, etc.) que cambian de valor según el atributo `data-theme="dark"` en el elemento raíz. Esto permite que todos los componentes respondan automáticamente al cambio de tema sin lógica adicional.

---

## Créditos

Desarrollado por [gmellado.cl](https://gmellado.cl)  
Versión: 0.01
