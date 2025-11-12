<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\PromoterController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ✅ ROTAS PÚBLICAS DE EVENTOS
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);
Route::get('/events/type/{type}', [EventController::class, 'getByType']);
Route::get('/events/search', [EventController::class, 'search']);

// ✅ ROTA DE DEBUG - TEMPORÁRIA
Route::get('/debug/events', [EventController::class, 'debugEvents']);

// Rotas para eventos arquivados
Route::get('/events/archived', [EventController::class, 'archived']);
Route::post('/events/{id}/restore', [EventController::class, 'restore']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rotas para gestão de perfil do promotor
    Route::get('/promoter/profile', [PromoterController::class, 'getProfile']);
    Route::put('/promoter/profile', [PromoterController::class, 'updateProfile']);
    Route::put('/promoter/password', [PromoterController::class, 'changePassword']);

    // Rotas protegidas de inscrições
    Route::post('/registrations', [RegistrationController::class, 'store']);
    Route::get('/registrations/user/{userId}', [RegistrationController::class, 'getByUser']);
    Route::get('/registrations/event/{eventId}', [RegistrationController::class, 'getByEvent']);
    Route::get('/registrations/check/{eventId}/{userId}', [RegistrationController::class, 'checkRegistration']);
    Route::put('/registrations/{id}/cancel', [RegistrationController::class, 'cancel']);

    // Rotas protegidas de eventos
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::get('/events/status/{status}', [EventController::class, 'getByStatus']);
    Route::post('/events/{id}/status', [EventController::class, 'updateStatus']);

    // Promoter CRUD (admin only)
    Route::get('/promoters', [PromoterController::class, 'index'])->middleware('role:admin');
    Route::post('/promoters', [PromoterController::class, 'store'])->middleware('role:admin');
    Route::get('/promoters/{promoter}', [PromoterController::class, 'show'])->middleware('role:admin');
    Route::put('/promoters/{promoter}', [PromoterController::class, 'update'])->middleware('role:admin');
    Route::delete('/promoters/{promoter}', [PromoterController::class, 'destroy'])->middleware('role:admin');
});