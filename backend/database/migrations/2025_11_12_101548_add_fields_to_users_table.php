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
            // ✅ ADICIONAR CAMPOS SE NÃO EXISTIREM
            if (!Schema::hasColumn('users', 'telefone')) {
                $table->string('telefone')->nullable()->after('email');
            }
            
            if (!Schema::hasColumn('users', 'tipo')) {
                $table->enum('tipo', ['estudante', 'docente', 'cta', 'admin', 'promotor'])
                      ->default('estudante')
                      ->after('password');
            }
            
            if (!Schema::hasColumn('users', 'nr_estudante')) {
                $table->string('nr_estudante')->nullable()->unique()->after('tipo');
            }
            
            if (!Schema::hasColumn('users', 'curso')) {
                $table->string('curso')->nullable()->after('nr_estudante');
            }
            
            if (!Schema::hasColumn('users', 'departamento')) {
                $table->string('departamento')->nullable()->after('curso');
            }
            
            if (!Schema::hasColumn('users', 'faculdade')) {
                $table->string('faculdade')->nullable()->after('departamento');
            }
            
            // ✅ ADICIONAR ÍNDICES
            if (!Schema::hasIndex('users', ['tipo'])) {
                $table->index('tipo');
            }
            
            if (!Schema::hasIndex('users', ['departamento'])) {
                $table->index('departamento');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // ✅ REMOVER CAMPOS (OPCIONAL - PARA ROLLBACK)
            $table->dropColumn([
                'telefone',
                'tipo', 
                'nr_estudante',
                'curso',
                'departamento',
                'faculdade'
            ]);
            
            // ✅ REMOVER ÍNDICES
            $table->dropIndex(['tipo']);
            $table->dropIndex(['departamento']);
        });
    }
};