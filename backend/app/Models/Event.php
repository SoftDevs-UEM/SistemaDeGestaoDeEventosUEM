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

    // Relationship with registrations (if you have a registrations table)
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }
}