<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Routing\Router;
use App\Http\Middleware\EnsureAdmin;

class AdminServiceProvider extends ServiceProvider {
    public function boot(Router $router){
        $router->aliasMiddleware('admin', EnsureAdmin::class);
    }
}
