<?php

namespace Tests\Feature\Models;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CastMemberTest extends TestCase
{

    use DatabaseMigrations;

    public function testList()
    {
        factory(CastMember::class, 1)->create();
        $castmembers = CastMember::all();
        $this->assertCount(1, $castmembers);

        $castMemberKeys = array_keys($castmembers->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id', 'name', 'type', 'created_at', 'updated_at', 'deleted_at'
        ], $castMemberKeys);
    }

    public function testCreate()
    {
        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_DIRECTOR
        ]);
        $castMember->refresh();

        $this->assertNotEmpty($castMember->id);
        $this->assertEquals(36, strlen($castMember->id));

        $this->assertEquals('test1', $castMember->name);
        $this->assertEquals($castMember->type, CastMember::TYPE_DIRECTOR);

        $castMember = CastMember::create([
            'name' => 'test1', 
            'type' => CastMember::TYPE_ACTOR
        ]);
        $this->assertEquals($castMember->type, CastMember::TYPE_ACTOR);
    }

    public function testUpdate()
    {
        $castMember = factory(CastMember::class)->create([
            'type' => CastMember::TYPE_ACTOR
        ]);

        $data = [
            'name' => 'test',
            'type' => CastMember::TYPE_DIRECTOR
        ];
        $castMember->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $castMember->{$key});
        }
    }

    public function testDelete()
    {
        $castMember = factory(CastMember::class)->create();
        $castMember->delete();
        $this->assertNull(CastMember::find($castMember->id));

        $castMember->restore();
        $this->assertNotNull(CastMember::find($castMember->id));
    }
}
