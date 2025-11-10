<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->date('date');
            $table->string('time');
            $table->string('location');
            $table->enum('type', ['academico', 'cultural', 'desportivo']);
            $table->string('category');
            $table->integer('max_participants');
            $table->foreignId('promoter_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pendente', 'aprovado', 'rejeitado', 'cancelado', 'finalizado'])->default('pendente');
            $table->text('image')->nullable();
            $table->text('requirements')->nullable();
            $table->string('target_audience');
            $table->text('feedback')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
