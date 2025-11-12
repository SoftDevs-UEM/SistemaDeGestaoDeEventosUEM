<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'date',
        'time',
        'location',
        'type',
        'category',
        'max_participants',
        'promoter_id',
        'status',
        'image',
        'requirements',
        'target_audience',
        'feedback'
    ];

    protected $dates = ['deleted_at'];
    
    protected $casts = [
        'date' => 'date',
        'max_participants' => 'integer'
    ];

    // Relationship with the promoter (User)
    public function promoter()
    {
        return $this->belongsTo(User::class, 'promoter_id');
    }

    // Relationship with registrations
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }

    // Relationship with participants through registrations
    public function participants()
    {
        return $this->hasManyThrough(
            User::class,
            Registration::class,
            'event_id',
            'id',
            'id',
            'user_id'
        );
    }

    // Check if event has available spots
    public function hasAvailableSpots()
    {
        return $this->participants_count < $this->max_participants;
    }

    // Get available spots count
    public function getAvailableSpots()
    {
        return $this->max_participants - $this->participants_count;
    }

    // Increment participants count
    public function incrementParticipants()
    {
        $this->increment('participants_count');
    }

    // Decrement participants count
    public function decrementParticipants()
    {
        if ($this->participants_count > 0) {
            $this->decrement('participants_count');
        }
    }

    // Scope para eventos ativos
    public function scopeActive($query)
    {
        return $query->where('status', 'ativo')
                    ->whereNull('deleted_at')
                    ->where('date', '>=', now()->format('Y-m-d'));
    }

    // Scope para eventos do promotor
    public function scopeByPromoter($query, $promoterId)
    {
        return $query->where('promoter_id', $promoterId)
                    ->whereNull('deleted_at');
    }
}