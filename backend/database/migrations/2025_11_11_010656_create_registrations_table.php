<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->string('numero_inscricao')->unique();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nome');
            $table->string('email');
            $table->string('telefone')->nullable();
            $table->string('matricula')->nullable();
            $table->string('curso')->nullable();
            $table->string('pagamento');
            $table->string('metodo_pagamento');
            $table->enum('status', ['pendente', 'confirmado', 'cancelado'])->default('confirmado');
            $table->timestamp('data_inscricao')->useCurrent();
            $table->timestamps();
            
            // Garantir que um usuário não se inscreva duas vezes no mesmo evento
            $table->unique(['event_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};