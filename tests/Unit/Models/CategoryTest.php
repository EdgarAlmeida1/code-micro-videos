<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use PHPUnit\Framework\TestCase;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\Uuid;

class CategoryTest extends TestCase
{

    public function testFillableAttribute()
    {
        $fillables = ['name', 'description', 'is_active'];
        $category = new Category();
        $this->assertEquals($fillables, $category->getFillable());
    }

    public function testIfUseTraits()
    {
        $traits = [SoftDeletes::class, Uuid::class];
        $categoryTraits = array_keys(class_uses(Category::class));
        $this->assertEquals($traits, $categoryTraits);
    }

    public function testCastsAttribute()
    {
        $casts = ['id' => 'string', 'is_active' => 'boolean'];
        $category = new Category();
        $this->assertEquals($casts, $category->getCasts());
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        $category = new Category();

        $this->assertEqualsCanonicalizing($dates, $category->getDates());
    }
}
