<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class BaseVideoControllerTestCase extends TestCase
{
    use DatabaseMigrations;

    protected $video;
    protected $sendData;
    protected $category;
    protected $genre;
    protected $serializedFields = [
        'id',
        'title',
        'description',
        'year_launched',
        'rating',
        'opened',
        'duration',
        'categories' => [
            '*' => [
                'id',
                'name',
                'description',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at',
            ]
        ],
        'genres' => [
            '*' => [
                'id',
                'name',
                'created_at',
                'updated_at',
                'deleted_at',
            ]
        ],
        'thumb_file',
        'banner_file',
        'trailer_file',
        'video_file',

        'thumb_file_url',
        'banner_file_url',
        'trailer_file_url',
        'video_file_url',

        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create([
            'opened' => false
        ]);

        $this->category = factory(Category::class)->create();
        $this->genre = factory(Genre::class)->create();
        $this->genre->categories()->sync($this->category->id);

        $this->sendData = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
        ];
    }
}
