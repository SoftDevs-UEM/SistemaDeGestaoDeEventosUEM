<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_inscricao',
        'event_id',
        'user_id',
        'nome',
        'email',
        'telefone',
        'matricula',
        'curso',
        'pagamento',
        'metodo_pagamento',
        'status',
        'data_inscricao'
    ];

    protected $casts = [
        'data_inscricao' => 'datetime'
    ];

    // Relationship with Event
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}