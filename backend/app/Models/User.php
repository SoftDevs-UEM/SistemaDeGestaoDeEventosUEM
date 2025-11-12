<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'telefone',
        'tipo',
        'nr_estudante',
        'curso',
        'departamento',
        'faculdade',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Check if user is a promoter
     */
    public function isPromoter()
    {
        return $this->tipo === 'promotor';
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin()
    {
        return $this->tipo === 'admin';
    }

    /**
     * Check if user is promoter or admin
     */
    public function isPromoterOrAdmin()
    {
        return $this->isPromoter() || $this->isAdmin();
    }

    /**
     * Check if user is student
     */
    public function isStudent()
    {
        return $this->tipo === 'estudante';
    }

    /**
     * Get user type label
     */
    public function getTipoLabelAttribute()
    {
        $labels = [
            'estudante' => 'Estudante',
            'docente' => 'Docente',
            'cta' => 'CTA',
            'admin' => 'Administrador',
            'promotor' => 'Promotor/Organizador',
        ];

        return $labels[$this->tipo] ?? $this->tipo;
    }
}