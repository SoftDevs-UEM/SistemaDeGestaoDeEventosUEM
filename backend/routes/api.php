<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\PromoterController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController; // ✅ ADICIONE ESTA LINHA

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ✅ ROTAS PÚBLICAS DE EVENTOS
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);
Route::get('/events/type/{type}', [EventController::class, 'getByType']);
Route::get('/events/search', [EventController::class, 'search']);

// Rotas para eventos arquivados
Route::get('/events/archived', [EventController::class, 'archived']);
Route::post('/events/{id}/restore', [EventController::class, 'restore']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ✅ ROTAS PROTEGIDAS DE INSCRIÇÕES (apenas usuários autenticados)
    Route::post('/registrations', [RegistrationController::class, 'store']);
    Route::get('/registrations/user/{userId}', [RegistrationController::class, 'getByUser']);
    Route::get('/registrations/event/{eventId}', [RegistrationController::class, 'getByEvent']);
    Route::get('/registrations/check/{eventId}/{userId}', [RegistrationController::class, 'checkRegistration']);
    Route::put('/registrations/{id}/cancel', [RegistrationController::class, 'cancel']);

    // ✅ ROTAS PROTEGIDAS DE EVENTOS (apenas para usuários autenticados)
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::get('/events/status/{status}', [EventController::class, 'getByStatus']);
    Route::post('/events/{id}/status', [EventController::class, 'updateStatus']);

    // Promoter CRUD (admin only for create/update/delete)
    Route::get('/promoters', [PromoterController::class, 'index'])->middleware('role:admin');
    Route::post('/promoters', [PromoterController::class, 'store'])->middleware('role:admin');
    Route::get('/promoters/{promoter}', [PromoterController::class, 'show'])->middleware('role:admin');
    Route::put('/promoters/{promoter}', [PromoterController::class, 'update'])->middleware('role:admin');
    Route::delete('/promoters/{promoter}', [PromoterController::class, 'destroy'])->middleware('role:admin');
});

// Admin-only test route
Route::get('/admin-only', function () {
    return response()->json(['ok' => 'admin']);
})->middleware(['auth:sanctum', 'role:admin']);

// ❌ REMOVA AS ROTAS DUPLICADAS QUE ESTÃO FORA DO MIDDLEWARE
// NÃO deixe estas linhas duplicadas:
// Route::post('/registrations', [RegistrationController::class, 'store']);
// Route::get('/registrations/user/{userId}', [RegistrationController::class, 'getByUser']);
// Route::get('/registrations/check/{eventId}/{userId}', [RegistrationController::class, 'checkRegistration']);