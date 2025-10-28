# Backend (Laravel 10) — Setup funcional

1) Crear proyecto Laravel y copiar carpeta `backend/` encima.
2) Instalar dependencias:
```bash
composer require laravel/sanctum barryvdh/laravel-dompdf:^2.0 endroid/qr-code:^5.0 stripe/stripe-php:^12.0
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
php artisan vendor:publish --tag="sanctum-migrations"
php artisan migrate
```
3) Variables `.env`:
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
SESSION_DOMAIN=localhost

QUEUE_CONNECTION=database
STRIPE_KEY=pk_test_xxx
STRIPE_SECRET=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```
4) Ejecutar:
```bash
php artisan queue:table && php artisan migrate
php artisan serve
php artisan queue:work
```
5) Webhook Stripe (modo dev): crea endpoint público a `/api/webhooks/stripe` con Stripe CLI:
```bash
stripe listen --forward-to http://localhost:8000/api/webhooks/stripe
```

**Importante**: Registra `App\Providers\AdminServiceProvider::class` en `config/app.php` (providers) para habilitar el middleware `admin`.
