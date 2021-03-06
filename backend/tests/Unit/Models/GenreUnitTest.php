<?php

namespace Tests\Unit\Models;

use App\Models\Genre;
use PHPUnit\Framework\TestCase;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\Uuid;
use EloquentFilter\Filterable;

class GenreUnitTest extends TestCase
{
    public function testFillableAttribute()
    {
        $fillables = ['name', 'is_active'];
        $genre = new Genre();
        $this->assertEquals($fillables, $genre->getFillable());
    }

    public function testIfUseTraits()
    {
        $traits = [SoftDeletes::class, Uuid::class, Filterable::class];
        $genreTraits = array_keys(class_uses(Genre::class));
        $this->assertEquals($traits, $genreTraits);
    }

    public function testCastsAttribute()
    {
        $casts = ['id' => 'string', 'is_active' => 'boolean'];
        $genre = new Genre();
        $this->assertEquals($casts, $genre->getCasts());
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        $genre = new Genre();

        $this->assertEqualsCanonicalizing($dates, $genre->getDates());
    }
}
