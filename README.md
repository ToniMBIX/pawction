# Pawction

Pawction es una plataforma web de subastas solidarias. El proyecto permite publicar packs benéficos, realizar pujas, guardar favoritos, consultar información de los animales mediante PDF y QR, completar datos de envío y finalizar pagos mediante Stripe.

## Repositorio

Repositorio del proyecto:

```txt
https://github.com/ToniMBIX/pawction
```

## Tecnologías utilizadas

### Backend

- Laravel 10
- PHP 8.2
- Laravel Sanctum para autenticación por token
- MySQL / Supabase PostgreSQL en despliegue
- Stripe para pagos
- Dompdf para generación de PDFs
- Endroid QR Code para generación de códigos QR
- Supabase Storage para almacenamiento de imágenes, documentos PDF y códigos QR

### Frontend

- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Despliegue en Vercel

### Despliegue

- Frontend: Vercel
- Backend: Railway
- Base de datos y storage: Supabase
- Pagos: Stripe en modo test
- Email transaccional: MailerSend / SMTP

## Estructura del proyecto

```txt
pawction/
├─ backend/              # API Laravel
├─ frontend/             # Aplicación React
├─ docker/               # Archivos Docker para ejecución local
├─ docker-compose.yml    # Entorno completo con backend, frontend y MySQL
└─ README.md
```

## Funcionalidades principales

- Registro e inicio de sesión de usuarios.
- Validación de correo electrónico con formato y dominio válido.
- Panel de administración para crear y cerrar subastas.
- Subidas de imagen y PDF asociadas a cada subasta.
- Generación de QR vinculado al PDF informativo.
- Listado público de subastas.
- Detalle de subasta con QR visible en la página.
- Sistema de pujas con contador de 24 horas reiniciado con cada puja.
- Actualización automática del listado y detalle de subastas.
- Favoritos por usuario.
- Historial de pujas.
- Pedidos pendientes de pago durante 24 horas.
- Checkout con Stripe.
- Confirmación de pago y actualización del estado de la subasta.

## Instalación con Docker

Esta opción levanta el proyecto completo en local usando Docker:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- MySQL: puerto local `3307`

### Requisitos previos

- Docker Desktop instalado.
- Docker Compose disponible.
- Git instalado.

### Pasos de ejecución

Clonar el repositorio:

```bash
git clone https://github.com/ToniMBIX/pawction.git
cd pawction
```

Levantar los contenedores:

```bash
docker compose up --build
```

Cuando termine el arranque, acceder a:

```txt
http://localhost:5173
```

La API estará disponible en:

```txt
http://localhost:8000/api
```

### Comprobar backend

Abrir en el navegador:

```txt
http://localhost:8000/api/ping
```

Debe devolver una respuesta JSON indicando que la API funciona.

## Variables de entorno relevantes

En Docker se incluyen variables por defecto para levantar la aplicación en local. Para probar funcionalidades externas reales hay que completar claves de servicios externos:

```env
STRIPE_KEY=pk_test_xxx
STRIPE_SECRET=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
SUPABASE_STORAGE_BUCKET=pawction
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailersend.net
MAIL_PORT=587
MAIL_USERNAME=xxxxx
MAIL_PASSWORD=xxxxx
MAIL_ENCRYPTION=tls
```

Para una demo local básica, el email puede dejarse como `MAIL_MAILER=log`.

## Instalación manual sin Docker

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

API local:

```txt
http://localhost:8000/api
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend local:

```txt
http://localhost:5173
```

El frontend necesita la variable:

```env
VITE_API_URL=http://localhost:8000/api
```

## Endpoints principales de la API

### Autenticación

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/me
PUT  /api/me
```

### Subastas públicas

```txt
GET /api/auctions
GET /api/auctions/{id}
GET /api/auctions/{id}/qr
```

### Pujas

```txt
POST /api/bids
GET  /api/bids/mine
```

### Favoritos

```txt
GET  /api/favorites
POST /api/favorites/{auction}
```

### Administración

```txt
GET    /api/admin/auctions
POST   /api/admin/auctions
DELETE /api/admin/auctions/{auction}
POST   /api/admin/auctions/{id}/close
```

### Envío y pagos

```txt
GET  /api/pending-orders
POST /api/shipping/submit
POST /api/payment/stripe-checkout
POST /api/payment/stripe-confirm
POST /api/webhooks/stripe
```

## Flujo principal de uso

1. El administrador crea una subasta añadiendo título, descripción, precio inicial, imagen y PDF.
2. El sistema sube los archivos a Supabase Storage y genera un QR asociado al PDF.
3. Un usuario registrado realiza una puja.
4. Cada puja reinicia el contador de la subasta a 24 horas.
5. Al cerrar la subasta, se asigna un ganador.
6. El ganador dispone de 24 horas para completar los datos de envío y pagar.
7. Stripe procesa el pago.
8. Al confirmarse el pago, la subasta queda marcada como pagada.

## Despliegue en producción

### Frontend en Vercel

Variable necesaria:

```env
VITE_API_URL=https://pawction-backend-production.up.railway.app/api
```

### Backend en Railway

Variables principales:

```env
APP_URL=https://pawction-backend-production.up.railway.app
FRONTEND_URL=https://pawction.vercel.app
SANCTUM_STATEFUL_DOMAINS=pawction.vercel.app
STRIPE_KEY=pk_test_xxx
STRIPE_SECRET=sk_test_xxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
SUPABASE_STORAGE_BUCKET=pawction
```

Comando de inicio recomendado:

```bash
php artisan optimize:clear && php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
```

## Autor

Proyecto desarrollado por Toni Marin Bou como proyecto final de desarrollo web.
