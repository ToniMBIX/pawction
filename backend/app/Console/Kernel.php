<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    
    protected $commands = [
        \App\Console\Commands\CloseExpiredAuctions::class,
    ];
    
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('auctions:close-expired')->everyMinute();
        $schedule->command('auctions:reopen-expired')->everyMinute();
        $schedule->command('auctions:daily-active-report')->dailyAt('09:00');
    }

    protected function commands(): void
    {
        
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
    
    protected $routeMiddleware = [
        // otros...
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ];
}
