<?php

namespace Tests\Unit\Models;

use App\Models\CastMember;
use PHPUnit\Framework\TestCase;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\Uuid;
use EloquentFilter\Filterable;

class CastMemberUnitTest extends TestCase
{
    public function testFillableAttribute()
    {
        $fillables = ['name', 'type'];
        $castMember = new CastMember();
        $this->assertEquals($fillables, $castMember->getFillable());
    }

    public function testIfUseTraits()
    {
        $traits = [SoftDeletes::class, Uuid::class, Filterable::class];
        $castMemberTraits = array_keys(class_uses(CastMember::class));
        $this->assertEquals($traits, $castMemberTraits);
    }

    public function testCastsAttribute()
    {
        $casts = ['id' => 'string', 'type' => 'integer'];
        $castMember = new CastMember();
        $this->assertEquals($casts, $castMember->getCasts());
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        $castMember = new CastMember();

        $this->assertEqualsCanonicalizing($dates, $castMember->getDates());
    }
}
