# Pawction — Subastas solidarias para adopción de animales

Monorepo con **frontend (React + Vite + Tailwind)** y **backend (Laravel 10)** listo para funcionar con:
- Registro/Login (Sanctum tokens)
- Subastas con reinicio de 24h en cada puja
- Favoritos por usuario
- **Pagos Stripe** (PaymentIntents + webhook verificado)
- Envío de email al ganador con PDF (Dompdf) y QR

## Puesta en marcha

### Backend
1) Crea un Laravel nuevo y copia `backend/` encima.
2) Instala dependencias:
```bash
composer require laravel/sanctum barryvdh/laravel-dompdf:^2.0 endroid/qr-code:^5.0 stripe/stripe-php:^12.0
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
php artisan vendor:publish --tag="sanctum-migrations"
php artisan migrate
php artisan queue:table && php artisan migrate
```
3) Configura `.env` con `APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, `STRIPE_*`.
4) Ejecuta:
```bash
php artisan serve
php artisan queue:work
```
5) Webhook dev:
```bash
stripe listen --forward-to http://localhost:8000/api/webhooks/stripe
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

> Asegúrate de poner `VITE_STRIPE_KEY` (publicable) y las claves privadas en el backend.

## Despliegue en Render
Usa `render.yaml` como **Blueprint**. Esto creará el backend (Docker), un worker de colas y el sitio estático del frontend. Configura `APP_URL`, `FRONTEND_URL` y las claves de Stripe en variables de entorno de Render.
