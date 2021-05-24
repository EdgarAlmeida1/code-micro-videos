<?php

namespace App\Http\Controllers\Api;

use App\Models\CastMember;

class CastMemberController extends BasicCrudController
{
    private $rules = [
        "name" => "required|max:255",
        "type" => "required|in:".CastMember::TYPE_DIRECTOR.",".CastMember::TYPE_ACTOR
    ];

    protected function model()
    {
        return CastMember::class;
    }
    protected function rulesStore()
    {
        return $this->rules;
    }
    protected function rulesUpdate()
    {
        return $this->rules;
    }
   
}
