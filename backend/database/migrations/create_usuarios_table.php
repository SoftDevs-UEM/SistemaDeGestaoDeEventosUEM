<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('telefone')->after('name');
            $table->enum('tipo', ['estudante', 'docente', 'cta'])->after('password');
            $table->string('nr_estudante')->nullable()->after('tipo');
            $table->string('curso')->nullable()->after('nr_estudante');
            $table->string('departamento')->nullable()->after('curso');
            
            // Renomear 'name' para 'nome' se quiser manter em português
            // $table->renameColumn('name', 'nome');
        });
    }

    public function down()
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn([
                'telefone',
                'tipo', 
                'nr_estudante',
                'curso',
                'departamento'
            ]);
        });
    }
};