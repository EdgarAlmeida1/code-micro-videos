<?php

namespace App\Http\Resources;

use App\Models\Genre;
use Illuminate\Http\Resources\Json\JsonResource;

class GenreResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        /** @var Genre $this */
        return parent::toArray($request) + [
            'categories' => CategoryResource::collection($this->categories)
        ];
    }
}
