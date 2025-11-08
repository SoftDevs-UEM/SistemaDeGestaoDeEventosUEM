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
        Schema::table('users', function (Blueprint $table) {
            // Add contact/role/profile fields to users table
            if (!Schema::hasColumn('users', 'telefone')) {
                $table->string('telefone')->nullable();
            }

            if (!Schema::hasColumn('users', 'tipo')) {
                // store role/type of user (estudante, docente, organizador, admin, cta, promotor)
                $table->string('tipo')->default('estudante');
            }

            if (!Schema::hasColumn('users', 'nr_estudante')) {
                $table->string('nr_estudante')->nullable();
            }

            if (!Schema::hasColumn('users', 'curso')) {
                $table->string('curso')->nullable();
            }

            if (!Schema::hasColumn('users', 'departamento')) {
                $table->string('departamento')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'telefone')) {
                $table->dropColumn('telefone');
            }
            if (Schema::hasColumn('users', 'tipo')) {
                $table->dropColumn('tipo');
            }
            if (Schema::hasColumn('users', 'nr_estudante')) {
                $table->dropColumn('nr_estudante');
            }
            if (Schema::hasColumn('users', 'curso')) {
                $table->dropColumn('curso');
            }
            if (Schema::hasColumn('users', 'departamento')) {
                $table->dropColumn('departamento');
            }
        });
    }
};
