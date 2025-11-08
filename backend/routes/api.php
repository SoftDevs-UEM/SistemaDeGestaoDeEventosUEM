<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\PromoterController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// Admin-only test route
Route::get('/admin-only', function () {
    return response()->json(['ok' => 'admin']);
})->middleware(['auth:sanctum', 'role:admin']);

// Promoter CRUD (admin only for create/update/delete)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/promoters', [PromoterController::class, 'index'])->middleware('role:admin');
    Route::post('/promoters', [PromoterController::class, 'store'])->middleware('role:admin');
    Route::get('/promoters/{promoter}', [PromoterController::class, 'show'])->middleware('role:admin');
    Route::put('/promoters/{promoter}', [PromoterController::class, 'update'])->middleware('role:admin');
    Route::delete('/promoters/{promoter}', [PromoterController::class, 'destroy'])->middleware('role:admin');
});