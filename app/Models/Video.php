<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Video extends Model
{
    use SoftDeletes, Traits\Uuid;

    const RATING_LIST = ['L', '10', '14', '16', '18'];

    protected $fillable = [
        'title', 
        'description',
        'year_launched',
        'opened',
        'rating',
        'duration'
    ];
    protected $dates = ['deleted_at'];

    protected $casts = [
        'id' => 'string',
        'opened' => 'boolean',
        'year_launched' => 'integer',
        'duration' => 'integer'
    ];
    public $incrementing = false;
    protected $keyType = 'string';

    
    // Relationships
    public function categories(){
        return $this->belongsToMany(Category::class);
    }
    public function genres(){
        return $this->belongsToMany(Genre::class);
    }
}
