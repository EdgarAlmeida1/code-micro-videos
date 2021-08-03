<?php

namespace App\ModelFilters;

use App\Models\CastMember;

class CastMemberFilter extends DefaultModelFilter
{
    protected $sortable = ["name", "type", "created_at"];

    public function search($search)
    {
        $this->query->where('name', 'LIKE', "%$search%");
    }

    public function type($type)
    {
        $type_ = (int) $type;
        if(in_array($type_, CastMember::$types)) {
            $this->where('type', $type_);
        }
    }
}
