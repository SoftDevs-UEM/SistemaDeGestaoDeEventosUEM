<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Ensure API and web routes are loaded (in case RouteServiceProvider is missing)
        if (file_exists(base_path('routes/api.php'))) {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));
        }

        if (file_exists(base_path('routes/web.php'))) {
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        }

        // Register role middleware alias in case the Http Kernel's sync didn't run early
        // This ensures the 'role' alias is always available when resolving route middleware.
        if ($this->app->bound('router')) {
            $this->app['router']->aliasMiddleware('role', \App\Http\Middleware\EnsureUserHasRole::class);
        }
    }
}
